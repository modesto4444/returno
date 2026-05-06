const crypto = require('crypto');
const fs = require('fs');

const DB_FILE = './db.json';
let counter = 845; // starts at BF-846 on first real item

function hash(data) {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

function loadChain() {
  if (!fs.existsSync(DB_FILE)) return [];
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function saveChain(chain) {
  fs.writeFileSync(DB_FILE, JSON.stringify(chain, null, 2));
}

function getNextId(chain) {
  // derive counter from last block index
  const realBlocks = chain.filter(b => b.index > 0);
  const num = 845 + realBlocks.length + 1;
  return `BF-${num}`;
}

function createGenesisBlock() {
  const block = {
    index: 0,
    timestamp: new Date().toISOString(),
    data: { type: 'GENESIS', message: 'Returno Chain Start' },
    previousHash: '0',
  };
  block.hash = hash(block);
  return block;
}

function getChain() {
  let chain = loadChain();
  if (chain.length === 0) {
    const genesis = createGenesisBlock();
    chain.push(genesis);
    saveChain(chain);
  }
  return chain;
}

function addBlock(itemData) {
  const chain = getChain();
  const prev = chain[chain.length - 1];

  const id = getNextId(chain);
  const timestamp = new Date();

  // Format blockTimestamp like: "Feb 5, 2026 14:32:00"
  const blockTimestamp = timestamp.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });

  const fullData = {
    ...itemData,
    id,
    blockTimestamp,
    verified: false,
    hasMatch: false,
    matchesWith: null
  };

  const block = {
    index: chain.length,
    timestamp: timestamp.toISOString(),
    data: fullData,
    previousHash: prev.hash,
  };

  block.hash = hash(block);
  // Store short hash like your sample: 'a8f5f167f44f...'
  block.data.blockHash = block.hash.substring(0, 12) + '...';

  chain.push(block);
  saveChain(chain);
  return block;
}

function getAllItems() {
  const chain = getChain();
  return chain.slice(1).map(b => b.data); // skip genesis
}

function updateBlock(chain, id, updates) {
  const block = chain.find(b => b.data && b.data.id === id);
  if (block) Object.assign(block.data, updates);
}

function isChainValid() {
  const chain = getChain();
  for (let i = 1; i < chain.length; i++) {
    const cur = chain[i];
    const prev = chain[i - 1];
    if (cur.previousHash !== prev.hash) return false;
  }
  return true;
}

module.exports = { getChain, addBlock, getAllItems, updateBlock, saveChain, isChainValid };