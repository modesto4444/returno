// ===== Sample Items Data (placeholder until blockchain integration) =====
const sampleItems = [
    {
        id: 'BF-847',
        type: 'lost',
        title: 'Black leather wallet',
        location: 'Lost near SV canteen',
        locationFull: 'Near SV Canteen',
        category: 'wallet',
        categoryLabel: 'Wallet',
        description: 'Black leather wallet with multiple card slots. Contains ID and credit cards.',
        date: 'February 5, 2026',
        blockTimestamp: 'Feb 5, 2026 14:32:00',
        blockHash: 'a8f5f167f44f...',
        icon: 'icons/wallet.png',
        verified: true,
        hasMatch: true,
        matchesWith: 'BF-852'
    },
    {
        id: 'BF-849',
        type: 'found',
        title: 'Android Phone',
        location: 'Found SM Manila Comfort Room',
        locationFull: 'SM Manila Comfort Room',
        category: 'electronics',
        categoryLabel: 'Electronics',
        description: 'Black Android smartphone found unattended. Screen is locked, has a clear case.',
        date: 'February 6, 2026',
        blockTimestamp: 'Feb 6, 2026 09:15:00',
        blockHash: 'b7c2e891a3df...',
        icon: 'icons/smartphone.png',
        verified: true,
        hasMatch: false,
        matchesWith: null
    },
    {
        id: 'BF-846',
        type: 'lost',
        title: 'Gold Key',
        location: 'SV Bldg Room 218',
        locationFull: 'SV Bldg Room 218',
        category: 'keys',
        categoryLabel: 'Keys',
        description: 'Small gold-colored key, possibly for a locker or cabinet. Has a red ribbon attached.',
        date: 'February 4, 2026',
        blockTimestamp: 'Feb 4, 2026 16:48:00',
        blockHash: 'c9d1f428b6ea...',
        icon: 'icons/key.png',
        verified: false,
        hasMatch: false,
        matchesWith: null
    },
    {
        id: 'BF-852',
        type: 'found',
        title: 'Black wallet',
        location: 'Found at SV Canteen',
        locationFull: 'SV Canteen',
        category: 'wallet',
        categoryLabel: 'Wallet',
        description: 'Black leather, has cards inside',
        date: 'February 5, 2026',
        blockTimestamp: 'Feb 5, 2026 16:20:00',
        blockHash: 'd4e8a219c7b5...',
        icon: 'icons/wallet.png',
        verified: true,
        hasMatch: true,
        matchesWith: 'BF-847'
    }
];

// ===== Card button actions =====
function handleAction(type) {
    switch(type) {
        case 'lost':
            window.location.href = 'report-lost.html';
            break;
        case 'found':
            window.location.href = 'report-found.html';
            break;
        case 'view':
            window.location.href = 'view-items.html';
            break;
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

// ===== Filter Logic =====
function filterItems() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const typeFilter = document.getElementById('typeFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;

    const filtered = sampleItems.filter(item => {
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
function populateItemDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('id');
    const item = sampleItems.find(i => i.id === itemId);

    if (!item) {
        document.querySelector('.detail-content').innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #888;">
                <h2>Item not found</h2>
                <p>The item you're looking for doesn't exist or has been removed.</p>
                <a href="view-items.html" style="color: #3b9eff;">← Back to Items</a>
            </div>
        `;
        return;
    }

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
}

// ===== Match Modal Functions =====
function handleViewMatch() {
    const urlParams = new URLSearchParams(window.location.search);
    const currentItemId = urlParams.get('id');
    const currentItem = sampleItems.find(i => i.id === currentItemId);

    if (!currentItem || !currentItem.matchesWith) {
        alert('No matching item found yet.');
        return;
    }

    const matchedItem = sampleItems.find(i => i.id === currentItem.matchesWith);
    if (!matchedItem) {
        alert('Matched item data not found.');
        return;
    }

    const lostItem = currentItem.type === 'lost' ? currentItem : matchedItem;
    const foundItem = currentItem.type === 'found' ? currentItem : matchedItem;

    document.getElementById('modalLostTitle').textContent = lostItem.title;
    document.getElementById('modalLostCategory').textContent = lostItem.categoryLabel;
    document.getElementById('modalLostLocation').textContent = lostItem.locationFull;
    document.getElementById('modalLostDate').textContent = lostItem.date;
    document.getElementById('modalLostDescription').textContent = lostItem.description;

    document.getElementById('modalFoundTitle').textContent = foundItem.title;
    document.getElementById('modalFoundCategory').textContent = foundItem.categoryLabel;
    document.getElementById('modalFoundLocation').textContent = foundItem.locationFull;
    document.getElementById('modalFoundDate').textContent = foundItem.date;
    document.getElementById('modalFoundDescription').textContent = foundItem.description;

    const criteria = buildMatchingCriteria(lostItem, foundItem);
    const criteriaList = document.getElementById('criteriaList');
    criteriaList.innerHTML = criteria.map(c => `
        <div class="criteria-row">
            <span class="criteria-text">${c.text}</span>
            <span class="criteria-match">${c.matched ? '✓ Match' : '✗ No match'}</span>
        </div>
    `).join('');

    document.getElementById('matchModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function buildMatchingCriteria(lost, found) {
    const criteria = [];

    criteria.push({
        text: `Same category (${lost.categoryLabel})`,
        matched: lost.category === found.category
    });

    const lostLocWords = lost.locationFull.toLowerCase().split(/\s+/);
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

    const lostDescWords = lost.description.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const foundDescWords = found.description.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const sharedWords = lostDescWords.filter(w => foundDescWords.includes(w));
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
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    fadeElements.forEach(el => observer.observe(el));

    // ===== Lost Item Form Handler =====
    const lostItemForm = document.getElementById('lostItemForm');
    if (lostItemForm) {
        lostItemForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = {
                type: 'lost',
                itemName: document.getElementById('itemName').value,
                category: document.getElementById('category').value,
                location: document.getElementById('location').value,
                dateLost: document.getElementById('dateLost').value,
                email: document.getElementById('email').value,
                timestamp: new Date().toISOString()
            };
            console.log('Lost Item Report Submitted:', formData);
            alert('Report submitted successfully! (Blockchain integration coming soon)');
        });
    }

    // ===== Found Item Form Handler =====
    const foundItemForm = document.getElementById('foundItemForm');
    if (foundItemForm) {
        foundItemForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = {
                type: 'found',
                itemName: document.getElementById('itemName').value,
                category: document.getElementById('category').value,
                location: document.getElementById('location').value,
                dateFound: document.getElementById('dateFound').value,
                email: document.getElementById('email').value,
                timestamp: new Date().toISOString()
            };
            console.log('Found Item Report Submitted:', formData);
            alert('Thank you! Your found item report has been submitted. (Blockchain integration coming soon)');
        });
    }

    // ===== View Items Page Init =====
    const itemsGrid = document.getElementById('itemsGrid');
    if (itemsGrid) {
        renderItems(sampleItems);
        document.getElementById('searchInput').addEventListener('input', filterItems);
        document.getElementById('typeFilter').addEventListener('change', filterItems);
        document.getElementById('categoryFilter').addEventListener('change', filterItems);
    }

    // ===== Item Details Page Init =====
    const detailPage = document.querySelector('.detail-page');
    if (detailPage) {
        populateItemDetails();

        const matchModal = document.getElementById('matchModal');
        const contactModal = document.getElementById('contactModal');

        // Modal close: click outside the card
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

        // Modal close: ESC key (closes whichever modal is open)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (contactModal && contactModal.classList.contains('active')) {
                    closeContactModal();
                } else if (matchModal && matchModal.classList.contains('active')) {
                    closeMatchModal();
                }
            }
        });

        // Contact form submission handler
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const urlParams = new URLSearchParams(window.location.search);
                const itemId = urlParams.get('id');

                const contactData = {
                    itemId: itemId,
                    name: document.getElementById('contactName').value,
                    email: document.getElementById('contactEmail').value,
                    phone: document.getElementById('contactPhone').value || null,
                    message: document.getElementById('contactMessage').value,
                    timestamp: new Date().toISOString()
                };

                console.log('Contact Request Submitted:', contactData);
                alert('Your contact request has been sent! The finder will be notified and will reach out if it\'s a confirmed match.');

                contactForm.reset();
                closeContactModal();
            });
        }
    }
});