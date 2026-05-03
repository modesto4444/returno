const { getChain, updateBlock, saveChain } = require('./blockchain');

function getMatchScore(a, b) {
  if (a.type === b.type) return 0; // must be one lost, one found

  let score = 0;

  // Category match
  if (a.category === b.category) score += 40;

  // Location overlap
  const aWords = a.location.toLowerCase().split(/\s+/);
  const bWords = b.location.toLowerCase().split(/\s+/);
  const sharedLoc = aWords.find(w => w.length > 2 && bWords.includes(w));
  if (sharedLoc) score += 30;

  // Date match
  if (a.date === b.date) score += 20;

  // Description keyword overlap
  const aDesc = a.description.toLowerCase().split(/\W+/).filter(w => w.length > 3);
  const bDesc = b.description.toLowerCase().split(/\W+/).filter(w => w.length > 3);
  const sharedWords = aDesc.filter(w => bDesc.includes(w));
  if (sharedWords.length >= 1) score += 10;

  return score;
}

function runMatcher(newItem) {
  const chain = getChain();
  const allItems = chain.slice(1).map(b => b.data);
  const opponents = allItems.filter(i => i.id !== newItem.id && i.type !== newItem.type);

  let bestMatch = null;
  let bestScore = 0;

  for (const candidate of opponents) {
    const score = getMatchScore(newItem, candidate);
    if (score >= 70 && score > bestScore) { // threshold: 70/100
      bestScore = score;
      bestMatch = candidate;
    }
  }

  if (bestMatch) {
    // Update both blocks
    updateBlock(chain, newItem.id, { hasMatch: true, matchesWith: bestMatch.id, verified: true });
    updateBlock(chain, bestMatch.id, { hasMatch: true, matchesWith: newItem.id, verified: true });
    saveChain(chain);
    return bestMatch;
  }

  return null;
}

module.exports = { runMatcher };