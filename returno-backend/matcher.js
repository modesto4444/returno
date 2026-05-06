// ── matcher.js ────────────────────────────────────────────────────────────────

/**
 * Returns a 0–100 score for how likely two reports refer to the same item.
 * One must be 'lost' and the other 'found' or the score is always 0.
 */
function getMatchScore(a, b) {
    if (a.type === b.type) return 0;

    let score = 0;

    // Category match (40 pts)
    if (a.category === b.category) score += 40;

    // Location word overlap (30 pts)
    const aWords = a.locationFull.toLowerCase().split(/\s+/);
    const bWords = b.locationFull.toLowerCase().split(/\s+/);
    if (aWords.find(w => w.length > 2 && bWords.includes(w))) score += 30;

    // Date match (20 pts)
    if (a.date === b.date) score += 20;

    // Description keyword overlap (10 pts)
    const aDesc = (a.description || '').toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const bDesc = (b.description || '').toLowerCase().split(/\W+/).filter(w => w.length > 3);
    if (aDesc.filter(w => bDesc.includes(w)).length >= 1) score += 10;

    return score;
}

/**
 * Finds the best match for newItem among all formatted reports,
 * calls contract.setMatch on-chain if score >= 70,
 * and returns { matchFound, matchedWith }.
 */
async function runMatcher(newItem, formattedAll, type, newIndex, contract) {
    const opponents = formattedAll.filter(r => r.type !== type);

    let bestMatch = null;
    let bestScore = 0;

    for (const candidate of opponents) {
        const score = getMatchScore(newItem, candidate);
        if (score >= 70 && score > bestScore) {
            bestScore = score;
            bestMatch = candidate;
        }
    }

    if (!bestMatch) {
        return { matchFound: false, matchedWith: null };
    }

    const opponentIndex = formattedAll.findIndex(r => r.id === bestMatch.id);
    const matchTx = await contract.setMatch(newIndex, opponentIndex);
    await matchTx.wait();

    console.log('🔗 Match found:', newItem.id, '↔', bestMatch.id, `(score: ${bestScore})`);
    return { matchFound: true, matchedWith: bestMatch.id };
}

module.exports = { getMatchScore, runMatcher };
