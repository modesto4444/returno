a// ===== API Base URL =====
const API = 'http://localhost:3000';

// ===== Global Items Cache =====
let allItems = [];

// ===== Toast Notification System =====
const TOAST_ICONS = { success: '✓', error: '✕', info: 'i' };
let toastTimer = null;

function showToast(type = 'info', title = '', message = '', duration = 4500) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    clearTimeout(toastTimer);

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon">${TOAST_ICONS[type] ?? 'i'}</div>
        <div class="toast-body">
            <div class="toast-title">${title}</div>
            ${message ? `<div class="toast-message">${message}</div>` : ''}
        </div>
        <button class="toast-close" aria-label="Dismiss">✕</button>
    `;

    document.body.appendChild(toast);
    requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));

    toast.querySelector('.toast-close').addEventListener('click', () => dismissToast(toast));
    toastTimer = setTimeout(() => dismissToast(toast), duration);
}

function dismissToast(toast) {
    if (!toast) return;
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
}

// ===== Card button actions =====
function handleAction(type) {
    switch(type) {
        case 'lost':  window.location.href = 'report-lost.html';  break;
        case 'found': window.location.href = 'report-found.html'; break;
        case 'view':  window.location.href = 'view-items.html';   break;
    }
}

// ===== Render Items into Grid =====
function renderItems(items) {
    const grid = document.getElementById('itemsGrid');
    if (!grid) return;

    if (items.length === 0) {
        grid.innerHTML = '<div class="empty-state">No items match your search.</div>';
        return;
    }

    grid.innerHTML = items.map(item => `
        <div class="item-card-wrapper" data-id="${item.id}">
            <div class="item-card">
                <div class="item-banner ${item.type}">
                    <img src="${item.icon}" alt="${item.title}">
                </div>
                <div class="item-body">
                    <span class="status-badge ${item.type}">${item.type.toUpperCase()}</span>
                    <h3 class="item-title">${item.title}</h3>
                    <p class="item-location">${item.location}</p>
                    <div class="item-footer">
                        ${item.verified ? '<span class="verified-tag">✓ Verified</span>' : '<span></span>'}
                        <span class="item-id">${item.id}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.item-card-wrapper').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.getAttribute('data-id');
            window.location.href = `item-details.html?id=${id}`;
        });
    });
}

// ===== Fetch Items from Blockchain Backend =====
async function loadItems() {
    const grid = document.getElementById('itemsGrid');
    if (grid) grid.innerHTML = '<div class="empty-state">Loading items from blockchain...</div>';

    try {
        const res = await fetch(`${API}/api/items`);
        const { items } = await res.json();
        allItems = items;
        renderItems(allItems);
    } catch (err) {
        console.error('Failed to load items:', err);
        if (grid) grid.innerHTML = '<div class="empty-state">Failed to connect to blockchain. Make sure the server is running.</div>';
        showToast('error', 'Connection Failed', 'Could not reach the blockchain server.');
    }
}

// ===== Filter Logic =====
function filterItems() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const typeFilter = document.getElementById('typeFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;

    const filtered = allItems.filter(item => {
        const matchesSearch = !searchTerm ||
            item.title.toLowerCase().includes(searchTerm) ||
            item.location.toLowerCase().includes(searchTerm);
        const matchesType = typeFilter === 'all' || item.type === typeFilter;
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
        return matchesSearch && matchesType && matchesCategory;
    });

    renderItems(filtered);
}

// ===== Item Details Page Population =====
async function populateItemDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('id');

    try {
        const res = await fetch(`${API}/api/items/${itemId}`);

        if (!res.ok) {
            document.querySelector('.detail-content').innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #888;">
                    <h2>Item not found</h2>
                    <p>The item you're looking for doesn't exist or has been removed.</p>
                    <a href="view-items.html" style="color: #3b9eff;">← Back to Items</a>
                </div>
            `;
            return;
        }

        const item = await res.json();

        const banner = document.getElementById('detailBanner');
        banner.classList.add(item.type);
        document.getElementById('detailIcon').src = item.icon;
        document.getElementById('detailIcon').alt = item.title;

        const statusBadge = document.getElementById('detailStatusBadge');
        statusBadge.textContent = item.type === 'lost' ? 'LOST ITEM' : 'FOUND ITEM';
        statusBadge.classList.add(item.type);

        const verified = document.getElementById('detailVerified');
        if (item.verified) {
            verified.textContent = '✓ Verified on Blockchain';
        } else {
            verified.textContent = 'Pending Verification';
            verified.style.color = '#888';
        }

        document.getElementById('detailTitle').textContent = item.title;
        document.getElementById('detailDescription').textContent = item.description;
        document.getElementById('detailCategory').textContent = item.categoryLabel;

        document.getElementById('detailLocationLabel').textContent =
            item.type === 'lost' ? 'Last Known Location' : 'Found Location';
        document.getElementById('detailLocation').textContent = item.locationFull;

        document.getElementById('detailDateLabel').textContent =
            item.type === 'lost' ? 'Date Lost' : 'Date Found';
        document.getElementById('detailDate').textContent = item.date;

        document.getElementById('detailBlockchainId').textContent = item.id;
        document.getElementById('detailItemId').textContent = item.id;
        document.getElementById('detailTimestamp').textContent = item.blockTimestamp;
        document.getElementById('detailHash').textContent = item.blockHash;

        if (!item.hasMatch) {
            document.getElementById('detailMatchBox').style.display = 'none';
        }

        document.title = `${item.title} - Returno`;

    } catch (err) {
        console.error('Failed to load item details:', err);
        showToast('error', 'Load Failed', 'Could not fetch item details from the server.');
    }
}

// ===== Match Modal Functions =====
async function handleViewMatch() {
    const urlParams = new URLSearchParams(window.location.search);
    const currentItemId = urlParams.get('id');

    try {
        const res = await fetch(`${API}/api/items/${currentItemId}`);
        const currentItem = await res.json();

        if (!currentItem.matchesWith) {
            showToast('info', 'No Match Yet', 'No matching item has been found yet.');
            return;
        }

        const matchRes = await fetch(`${API}/api/items/${currentItem.matchesWith}`);
        const matchedItem = await matchRes.json();

        const lostItem  = currentItem.type === 'lost'  ? currentItem : matchedItem;
        const foundItem = currentItem.type === 'found' ? currentItem : matchedItem;

        document.getElementById('modalLostTitle').textContent       = lostItem.title;
        document.getElementById('modalLostCategory').textContent    = lostItem.categoryLabel;
        document.getElementById('modalLostLocation').textContent    = lostItem.locationFull;
        document.getElementById('modalLostDate').textContent        = lostItem.date;
        document.getElementById('modalLostDescription').textContent = lostItem.description;

        document.getElementById('modalFoundTitle').textContent       = foundItem.title;
        document.getElementById('modalFoundCategory').textContent    = foundItem.categoryLabel;
        document.getElementById('modalFoundLocation').textContent    = foundItem.locationFull;
        document.getElementById('modalFoundDate').textContent        = foundItem.date;
        document.getElementById('modalFoundDescription').textContent = foundItem.description;

        const criteria     = buildMatchingCriteria(lostItem, foundItem);
        const criteriaList = document.getElementById('criteriaList');
        criteriaList.innerHTML = criteria.map(c => `
            <div class="criteria-row">
                <span class="criteria-text">${c.text}</span>
                <span class="criteria-match ${c.matched ? '' : 'unmatched'}">${c.matched ? '✓ Match' : '✗ No match'}</span>
            </div>
        `).join('');

        document.getElementById('matchModal').classList.add('active');
        document.body.style.overflow = 'hidden';

    } catch (err) {
        console.error('Failed to load match:', err);
        showToast('error', 'Match Load Failed', 'Could not load match details. Please try again.');
    }
}

function buildMatchingCriteria(lost, found) {
    const criteria = [];

    criteria.push({
        text: `Same category (${lost.categoryLabel})`,
        matched: lost.category === found.category
    });

    const lostLocWords  = lost.locationFull.toLowerCase().split(/\s+/);
    const foundLocWords = found.locationFull.toLowerCase().split(/\s+/);
    const sharedLocation = lostLocWords.find(w => w.length > 2 && foundLocWords.includes(w));
    criteria.push({
        text: `Same location area (${sharedLocation ? capitalize(sharedLocation) + ' area' : 'different'})`,
        matched: !!sharedLocation
    });

    criteria.push({
        text: `Same date (${lost.date})`,
        matched: lost.date === found.date
    });

    const lostDescWords  = lost.description.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const foundDescWords = found.description.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const sharedWords    = lostDescWords.filter(w => foundDescWords.includes(w));
    criteria.push({
        text: `Similar description keywords (${sharedWords.slice(0, 3).join(', ') || 'none'})`,
        matched: sharedWords.length >= 1
    });

    return criteria;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function closeMatchModal() {
    document.getElementById('matchModal').classList.remove('active');
    document.body.style.overflow = '';
}

// ===== Contact Modal Functions =====
function handleContactFinder() {
    closeMatchModal();
    document.getElementById('contactModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeContactModal() {
    document.getElementById('contactModal').classList.remove('active');
    document.body.style.overflow = '';
}

// ===== DOM Ready =====
document.addEventListener('DOMContentLoaded', () => {

    // Fade-in animation on scroll
    const fadeElements = document.querySelectorAll('.card-wrapper, .step, .hero-content');
    fadeElements.forEach(el => el.classList.add('fade-in'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    fadeElements.forEach(el => observer.observe(el));

    // ===== Lost Item Form =====
    const lostItemForm = document.getElementById('lostItemForm');
    if (lostItemForm) {
        lostItemForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = lostItemForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;

            try {
                const res = await fetch(`${API}/api/report`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'lost',
                        itemName:    document.getElementById('itemName').value,
                        category:    document.getElementById('category').value,
                        location:    document.getElementById('location').value,
                        dateLost:    document.getElementById('dateLost').value,
                        email:       document.getElementById('email').value,
                        description: document.getElementById('description')?.value || ''
                    })
                });

                const data = await res.json();

                if (res.ok) {
                    if (data.matchFound) {
                        showToast('success', 'Report Recorded + Match Found!',
                            `ID: ${data.item.id} — Potential match: ${data.matchedWith}`);
                    } else {
                        showToast('success', 'Report Recorded on Blockchain',
                            `Your report ID is ${data.item.id}`);
                    }
                    lostItemForm.reset();
                    setTimeout(() => window.location.href = 'view-items.html', 2000);
                } else {
                    showToast('error', 'Submission Failed', data.error || 'Please check your details and try again.');
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            } catch (err) {
                console.error(err);
                showToast('error', 'Connection Failed', 'Make sure the backend server is running.');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // ===== Found Item Form =====
    const foundItemForm = document.getElementById('foundItemForm');
    if (foundItemForm) {
        foundItemForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = foundItemForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;

            try {
                const res = await fetch(`${API}/api/report`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'found',
                        itemName:    document.getElementById('itemName').value,
                        category:    document.getElementById('category').value,
                        location:    document.getElementById('location').value,
                        dateFound:   document.getElementById('dateFound').value,
                        email:       document.getElementById('email').value,
                        description: document.getElementById('description')?.value || ''
                    })
                });

                const data = await res.json();

                if (res.ok) {
                    if (data.matchFound) {
                        showToast('success', 'Report Recorded + Match Found!',
                            `ID: ${data.item.id} — A potential owner has been identified.`);
                    } else {
                        showToast('success', 'Report Recorded on Blockchain',
                            `Your found item report ID is ${data.item.id}`);
                    }
                    foundItemForm.reset();
                    setTimeout(() => window.location.href = 'view-items.html', 2000);
                } else {
                    showToast('error', 'Submission Failed', data.error || 'Please check your details and try again.');
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            } catch (err) {
                console.error(err);
                showToast('error', 'Connection Failed', 'Make sure the backend server is running.');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // ===== View Items Page Init =====
    const itemsGrid = document.getElementById('itemsGrid');
    if (itemsGrid) {
        loadItems();
        document.getElementById('searchInput').addEventListener('input', filterItems);
        document.getElementById('typeFilter').addEventListener('change', filterItems);
        document.getElementById('categoryFilter').addEventListener('change', filterItems);
    }

    // ===== Item Details Page Init =====
    const detailPage = document.querySelector('.detail-page');
    if (detailPage) {
        populateItemDetails();

        const matchModal   = document.getElementById('matchModal');
        const contactModal = document.getElementById('contactModal');

        if (matchModal) {
            matchModal.addEventListener('click', (e) => {
                if (e.target === matchModal) closeMatchModal();
            });
        }
        if (contactModal) {
            contactModal.addEventListener('click', (e) => {
                if (e.target === contactModal) closeContactModal();
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (contactModal?.classList.contains('active')) closeContactModal();
                else if (matchModal?.classList.contains('active')) closeMatchModal();
            }
        });

        // Contact form submission
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const urlParams = new URLSearchParams(window.location.search);
                const itemId    = urlParams.get('id');

                const contactData = {
                    itemId:    itemId,
                    name:      document.getElementById('contactName').value,
                    email:     document.getElementById('contactEmail').value,
                    phone:     document.getElementById('contactPhone').value || null,
                    message:   document.getElementById('contactMessage').value,
                    timestamp: new Date().toISOString()
                };

                console.log('Contact Request Submitted:', contactData);

                contactForm.reset();
                closeContactModal();

                showToast('success', 'Message Sent!',
                    'The finder has been notified and will reach out if it\'s a confirmed match.');
            });
        }
    }
});
