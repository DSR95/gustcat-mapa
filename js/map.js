// Afegir marcadors al mapa - AMB NOUS EMOJIS
function addMarkersToMap(shops) {
    if (!map) {
        console.error('Map not initialized');
        return;
    }
    
    // Eliminar marcadors existents
    markers.forEach(marker => {
        try {
            map.removeLayer(marker);
        } catch (e) {
            console.warn('Error removing marker:', e);
        }
    });
    markers = [];
    
    console.log(`Adding ${shops.length} markers to map`);
    
    shops.forEach(shop => {
        if (shop.lat && shop.lng) {
            const emoji = getCategoryEmoji(shop.producte1_categoria);
            
            const icon = L.divIcon({
                className: 'custom-marker',
                html: `<div class="custom-marker">${emoji}</div>`,
                iconSize: [35, 35],
                iconAnchor: [17, 17]
            });
            
            try {
                const marker = L.marker([shop.lat, shop.lng], { icon })
                    .bindPopup(createPopupContent(shop))
                    .addTo(map);
                
                markers.push(marker);
            } catch (error) {
                console.error('Error adding marker for shop:', shop.nom, error);
            }
        }
    });
    
    // Ajustar vista del mapa
    if (markers.length > 0) {
        try {
            const group = new L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.1));
            console.log(`Map fitted to ${markers.length} markers`);
        } catch (error) {
            console.error('Error fitting map bounds:', error);
        }
    }
}

// Crear contingut del popup
function createPopupContent(shop) {
    return `
        <div class="popup-content">
            <div class="popup-header">
                <h4>${shop.nom}</h4>
                <span class="popup-category">${shop.producte1_categoria || 'Altres'}</span>
            </div>
            <div class="popup-body">
                <p><i class="fas fa-map-marker-alt"></i> ${shop.municipi}${shop.comarca ? ', ' + shop.comarca : ''}</p>
                ${shop.producte1_nom ? `
                    <div class="popup-product">
                        <strong>${shop.producte1_nom}</strong>
                        ${shop.producte1_preu ? `<span style="color: var(--accent-color); font-weight: bold;">${shop.producte1_preu}</span>` : ''}
                    </div>
                ` : ''}
                ${shop.producte2_nom ? `
                    <div class="popup-product">
                        <strong>${shop.producte2_nom}</strong>
                        ${shop.producte2_preu ? `<span style="color: var(--accent-color); font-weight: bold;">${shop.producte2_preu}</span>` : ''}
                    </div>
                ` : ''}
                <div class="popup-actions">
                    <button class="popup-btn popup-btn-primary" onclick="showShopDetails(${allShops.indexOf(shop)})">
                        <i class="fas fa-info-circle"></i> Més info
                    </button>
                    ${shop.telefon ? `
                        <button class="popup-btn popup-btn-secondary" onclick="window.location.href='tel:${shop.telefon}'">
                            <i class="fas fa-phone"></i> Trucar
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// Aplicar filtres del mapa
function applyMapFilters() {
    const checkedCategories = Array.from(document.querySelectorAll('#categoryFilters input:checked'))
        .map(input => input.dataset.cat);
    
    console.log('Applying map filters for categories:', checkedCategories);
    
    const filtered = allShops.filter(shop => 
        checkedCategories.includes(shop.producte1_categoria) ||
        checkedCategories.includes(shop.producte2_categoria)
    );
    
    console.log(`Map filtered: ${filtered.length} shops`);
    addMarkersToMap(filtered);
}
