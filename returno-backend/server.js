const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { ethers } = require('ethers');
const { runMatcher } = require('./matcher');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, '../')));
app.use(express.json());

// ── Auto-read contract address ──────────────────────────
const configPath = path.join(__dirname, 'contract-config.json');
let CONTRACT_ADDRESS;

try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    CONTRACT_ADDRESS = config.CONTRACT_ADDRESS;
    console.log('📄 Using contract:', CONTRACT_ADDRESS);
} catch (err) {
    console.error('❌ contract-config.json not found. Run deploy.js first.');
    process.exit(1);
}

const CONTRACT_ABI = [
    {"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"reportId","type":"string"},{"indexed":false,"internalType":"string","name":"matchedWith","type":"string"}],"name":"MatchFound","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"id","type":"string"},{"indexed":false,"internalType":"string","name":"itemType","type":"string"},{"indexed":false,"internalType":"string","name":"title","type":"string"},{"indexed":false,"internalType":"address","name":"reporter","type":"address"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"ReportCreated","type":"event"},
    {"inputs":[],"name":"getAllReports","outputs":[{"components":[{"internalType":"string","name":"id","type":"string"},{"internalType":"string","name":"itemType","type":"string"},{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"category","type":"string"},{"internalType":"string","name":"location","type":"string"},{"internalType":"string","name":"date","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"address","name":"reporter","type":"address"},{"internalType":"bool","name":"hasMatch","type":"bool"},{"internalType":"string","name":"matchesWith","type":"string"}],"internalType":"struct Returno.Report[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"getReport","outputs":[{"components":[{"internalType":"string","name":"id","type":"string"},{"internalType":"string","name":"itemType","type":"string"},{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"category","type":"string"},{"internalType":"string","name":"location","type":"string"},{"internalType":"string","name":"date","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"address","name":"reporter","type":"address"},{"internalType":"bool","name":"hasMatch","type":"bool"},{"internalType":"string","name":"matchesWith","type":"string"}],"internalType":"struct Returno.Report","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"reportCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"reports","outputs":[{"internalType":"string","name":"id","type":"string"},{"internalType":"string","name":"itemType","type":"string"},{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"category","type":"string"},{"internalType":"string","name":"location","type":"string"},{"internalType":"string","name":"date","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"address","name":"reporter","type":"address"},{"internalType":"bool","name":"hasMatch","type":"bool"},{"internalType":"string","name":"matchesWith","type":"string"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"indexA","type":"uint256"},{"internalType":"uint256","name":"indexB","type":"uint256"}],"name":"setMatch","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"string","name":"_type","type":"string"},{"internalType":"string","name":"_title","type":"string"},{"internalType":"string","name":"_category","type":"string"},{"internalType":"string","name":"_location","type":"string"},{"internalType":"string","name":"_date","type":"string"},{"internalType":"string","name":"_description","type":"string"}],"name":"submitReport","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"}
];

// ── Connect to local hardhat node ─────────────────────────
const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');

// NonceManager auto-increments nonces so submitReport + setMatch never collide
const wallet = new ethers.NonceManager(
    new ethers.Wallet(
        '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
        provider
    )
);

const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

// ── Helpers ───────────────────────────────────
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function categoryToIcon(category) {
    const map = {
        wallet: 'wallet.png', electronics: 'smartphone.png',
        keys: 'key.png', bag: 'bag.png',
        documents: 'id.png', other: 'data.png'
    };
    return map[category] || 'data.png';
}

function formatReport(r) {
    return {
        id: r.id,
        type: r.itemType,
        title: r.title,
        category: r.category,
        categoryLabel: capitalize(r.category),
        location: `${r.itemType === 'lost' ? 'Lost' : 'Found'} at ${r.location}`,
        locationFull: r.location,
        date: new Date(Number(r.timestamp) * 1000).toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric'
        }),
        description: r.description,
        blockTimestamp: new Date(Number(r.timestamp) * 1000).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        }),
        blockHash: r.id + '_' + r.timestamp.toString().substring(0, 8) + '...',
        verified: r.hasMatch,
        hasMatch: r.hasMatch,
        matchesWith: r.matchesWith || null,
        icon: `icons/${categoryToIcon(r.category)}`
    };
}

// ── Routes ────────────────────────────────────

// GET all items
app.get('/api/items', async (req, res) => {
    try {
        const reports = await contract.getAllReports();
        const items = reports.map(formatReport);
        res.json({ valid: true, items });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch from blockchain' });
    }
});

// GET single item
app.get('/api/items/:id', async (req, res) => {
    try {
        const reports = await contract.getAllReports();
        const report = reports.find(r => r.id === req.params.id);
        if (!report) return res.status(404).json({ error: 'Item not found' });
        res.json(formatReport(report));
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch item' });
    }
});

// POST new report
app.post('/api/report', async (req, res) => {
    const { type, itemName, category, location, dateLost, dateFound, description } = req.body;

    if (!['lost', 'found'].includes(type)) {
        return res.status(400).json({ error: 'type must be lost or found' });
    }
    if (!itemName || !category || !location) {
        return res.status(400).json({ error: 'itemName, category, and location are required' });
    }

    try {
        const tx = await contract.submitReport(
            type, itemName, category, location,
            dateLost || dateFound || new Date().toISOString().split('T')[0],
            description || ''
        );

        console.log('⏳ Transaction sent:', tx.hash);
        const receipt = await tx.wait();
        console.log('✅ Confirmed in block:', receipt.blockNumber);

        const count = await contract.reportCount();
        const newIndex = Number(count) - 1;
        const newReport = await contract.getReport(newIndex);
        const itemData = formatReport(newReport);
        itemData.blockHash = tx.hash.substring(0, 12) + '...';

        // Fetch all reports and run matcher
        const allReports = await contract.getAllReports();
        const formattedAll = allReports.map(formatReport);

        const { matchFound, matchedWith } = await runMatcher(
            itemData, formattedAll, type, newIndex, contract
        );

        res.status(201).json({
            message: 'Recorded on blockchain',
            item: itemData,
            transactionHash: tx.hash,
            blockNumber: receipt.blockNumber,
            matchFound,
            matchedWith
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Transaction failed: ' + err.message });
    }
});

// GET chain validity
app.get('/api/verify', async (req, res) => {
    try {
        const count = await contract.reportCount();
        res.json({
            valid: true,
            totalReports: Number(count),
            network: 'Hardhat Local',
            contract: CONTRACT_ADDRESS
        });
    } catch (err) {
        res.status(500).json({ valid: false });
    }
});

app.listen(3000, () => console.log('🚀 Returno running on http://localhost:3000'));
