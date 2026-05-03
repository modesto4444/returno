const express = require('express');
const cors = require('cors');
const path = require('path');
const { addBlock, getAllItems, isChainValid } = require('./blockchain');
const { runMatcher } = require('./matcher');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, '../'))); // serves your returno frontend
app.use(express.json());

// GET all items — replaces sampleItems in script.js
app.get('/api/items', (req, res) => {
  const items = getAllItems();
  res.json({ valid: isChainValid(), items });
});

// GET single item by id — for item-details.html
app.get('/api/items/:id', (req, res) => {
  const items = getAllItems();
  const item = items.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  res.json(item);
});

// POST lost or found report — replaces the alert() in your form handlers
app.post('/api/report', (req, res) => {
  const { type, itemName, category, location, dateLost, dateFound, email, description } = req.body;

  if (!['lost', 'found'].includes(type)) {
    return res.status(400).json({ error: 'type must be lost or found' });
  }
  if (!itemName || !category || !location) {
    return res.status(400).json({ error: 'itemName, category, and location are required' });
  }

  const itemData = {
    type,
    title: itemName,
    name: itemName,
    category,
    categoryLabel: capitalize(category),
    location: `${type === 'lost' ? 'Lost' : 'Found'} at ${location}`,
    locationFull: location,
    date: formatDate(dateLost || dateFound),
    description: description || '',
    email: email || null,
    icon: `icons/${categoryToIcon(category)}`,
  };

  const block = addBlock(itemData);
  const match = runMatcher(block.data);

  res.status(201).json({
    message: 'Recorded on blockchain',
    item: block.data,
    matchFound: !!match,
    matchedWith: match ? match.id : null
  });
});

// GET chain validity
app.get('/api/verify', (req, res) => {
  res.json({ valid: isChainValid() });
});

// ── Helpers ──────────────────────────────────────────────
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(dateStr) {
  if (!dateStr) return new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function categoryToIcon(category) {
  const map = {
    wallet: 'wallet.png',
    electronics: 'smartphone.png',
    keys: 'key.png',
    bag: 'bag.png',
    id: 'id.png',
    other: 'data.png'
  };
  return map[category] || 'data.png';
}

app.listen(3000, () => console.log('Returno running on http://localhost:3000'));