// Crear targeta de comerç - FOOTER SEMPRE A BAIX
function createShopCard(shop) {
    return `
        <div class="commerce-card" onclick="showShopDetails(${allShops.indexOf(shop)})">
            <div class="commerce-header">
                <h3>${shop.nom}</h3>
<div class="commerce-location">
    <i class="fas fa-map-marker-alt"></i>
    ${shop.municipi}${shop.comarca ? ', ' + shop.comarca : ''}
</div>
${shop.descripcio_comerc ? `
    <p style="margin-top: 1rem; font-size: 0.95rem; opacity: 0.9; font-style: italic;">
        ${shop.descripcio_comerc}
    </p>
` : ''}


            </div>
            <div class="commerce-body">
                <div class="products-container">
                    ${shop.producte1_nom ? `
                        <div class="product-showcase">
                            <div class="product-content${!shop.producte1_foto ? ' no-image' : ''}">
                                <div class="product-info">
                                    <h4 style="margin-bottom: 0.8rem; color: var(--primary-color); font-weight: 600;">
                                        ${shop.producte1_nom}
                                    </h4>
                                    ${shop.producte1_descripcio ? `<p>${shop.producte1_descripcio}</p>` : ''}
                                    ${shop.producte1_preu ? `<span class="product-price">${shop.producte1_preu}</span>` : ''}
                                </div>
                                ${shop.producte1_foto ? `
                                    <img src="${shop.producte1_foto}" 
                                         alt="${shop.producte1_nom}" 
                                         class="product-image"
                                         onclick="event.stopPropagation(); openImageModal('${shop.producte1_foto}', '${shop.producte1_nom}')"
                                         onerror="console.log('Error loading image: ${shop.producte1_foto}'); this.style.display='none'; this.parentElement.classList.add('no-image');"
                                         onload="console.log('Image loaded successfully: ${shop.producte1_foto}')">
                                ` : ''}
                            </div>
                        </div>
                    ` : ''}
                    ${shop.producte2_nom ? `
                        <div class="product-showcase">
                            <div class="product-content${!shop.producte2_foto ? ' no-image' : ''}">
                                <div class="product-info">
                                    <h4 style="margin-bottom: 0.8rem; color: var(--primary-color); font-weight: 600;">
                                        ${shop.producte2_nom}
                                    </h4>
                                    ${shop.producte2_descripcio ? `<p>${shop.producte2_descripcio}</p>` : ''}
                                    ${shop.producte2_preu ? `<span class="product-price">${shop.producte2_preu}</span>` : ''}
                                </div>
                                ${shop.producte2_foto ? `
                                    <img src="${shop.producte2_foto}" 
                                         alt="${shop.producte2_nom}" 
                                         class="product-image"
                                         onclick="event.stopPropagation(); openImageModal('${shop.producte2_foto}', '${shop.producte2_nom}')"
                                         onerror="console.log('Error loading image: ${shop.producte2_foto}'); this.style.display='none'; this.parentElement.classList.add('no-image');"
                                         onload="console.log('Image loaded successfully: ${shop.producte2_foto}')">
                                ` : ''}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="commerce-footer">
                <span class="commerce-category">${shop.producte1_categoria || 'Altres'}</span>
                <div class="commerce-actions">
                    ${shop.telefon ? `<button class="action-btn" onclick="event.stopPropagation(); window.location.href='tel:${shop.telefon}'"><i class="fas fa-phone"></i></button>` : ''}
                    ${shop.email ? `<button class="action-btn" onclick="event.stopPropagation(); window.location.href='mailto:${shop.email}'"><i class="fas fa-envelope"></i></button>` : ''}
                    ${shop.web ? `<button class="action-btn" onclick="event.stopPropagation(); window.open('${shop.web.startsWith('http') ? shop.web : 'https://' + shop.web}', '_blank')"><i class="fas fa-globe"></i></button>` : ''}
                </div>
            </div>
        </div>
    `;
}

// Mostrar comerços
function displayShops(shops) {
    const container = document.getElementById('shops-container');
    if (!container) return;
    
    if (shops.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                <h3 style="color: var(--text-light);">No s'han trobat comerços</h3>
                <p style="color: var(--text-muted);">Prova amb uns altres criteris de cerca</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = shops.map(shop => createShopCard(shop)).join('');
}

// Actualitzar filtres
function updateFilters() {
    const comarques = [...new Set(allShops.map(s => s.comarca).filter(Boolean))].sort();
    const municipis = [...new Set(allShops.map(s => s.municipi).filter(Boolean))].sort();
    
    const comarcaFilter = document.getElementById('comarca-filter');
    if (comarcaFilter) {
        comarcaFilter.innerHTML = '<option value="">📍 Totes les comarques</option>';
        comarques.forEach(comarca => {
            comarcaFilter.innerHTML += `<option value="${comarca}">${comarca}</option>`;
        });
    }
    
    const municipiFilter = document.getElementById('municipi-filter');
    if (municipiFilter) {
        municipiFilter.innerHTML = '<option value="">🏘️ Tots els municipis</option>';
        municipis.forEach(municipi => {
            municipiFilter.innerHTML += `<option value="${municipi}">${municipi}</option>`;
        });
    }
}

// Aplicar filtres
function applyFilters() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const selectedComarca = document.getElementById('comarca-filter')?.value || '';
    const selectedMunicipi = document.getElementById('municipi-filter')?.value || '';
    const selectedCategoria = document.getElementById('categoria-filter')?.value || '';
    
    filteredShops = allShops.filter(shop => {
        const matchSearch = !searchTerm || 
            shop.nom.toLowerCase().includes(searchTerm) ||
            shop.municipi.toLowerCase().includes(searchTerm) ||
            shop.producte1_nom.toLowerCase().includes(searchTerm) ||
            shop.producte2_nom.toLowerCase().includes(searchTerm);
        
        const matchComarca = !selectedComarca || shop.comarca === selectedComarca;
        const matchMunicipi = !selectedMunicipi || shop.municipi === selectedMunicipi;
        const matchCategoria = !selectedCategoria || 
            shop.producte1_categoria === selectedCategoria ||
            shop.producte2_categoria === selectedCategoria;
        
        return matchSearch && matchComarca && matchMunicipi && matchCategoria;
    });
    
    displayShops(filteredShops);
    updateResultsCount();
    
    console.log(`Filtered shops: ${filteredShops.length} of ${allShops.length}`);
}

// Actualitzar comptador de resultats
function updateResultsCount() {
    const countElement = document.getElementById('resultsCount');
    if (countElement) {
        countElement.textContent = `${filteredShops.length} comerços trobats`;
    }
}

// Canviar mode de vista
function setViewMode(mode) {
    currentViewMode = mode;
    const container = document.getElementById('shops-container');
    const gridBtn = document.querySelector('.view-btn:first-child');
    const listBtn = document.querySelector('.view-btn:last-child');
    
    if (!container || !gridBtn || !listBtn) return;
    
    if (mode === 'grid') {
        container.className = 'commerce-grid fade-in-stagger';
        gridBtn.classList.add('active');
        listBtn.classList.remove('active');
    } else {
        container.className = 'commerce-list fade-in-stagger';
        gridBtn.classList.remove('active');
        listBtn.classList.add('active');
    }
}
