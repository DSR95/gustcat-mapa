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

                
<div class="popup-actions" style="display: flex; flex-direction: column; gap: 0.8rem;">
    <button class="popup-btn popup-btn-primary" onclick="showShopDetails(${allShops.indexOf(shop)})" style="width: 100%;">
        <i class="fas fa-info-circle"></i> Més info
    </button>
    <div style="display: flex; gap: 0.4rem;">
        ${shop.telefon ? `
            <button class="popup-btn popup-btn-secondary" onclick="window.location.href='tel:${shop.telefon}'" style="flex: 1; padding: 0.8rem 0.2rem;">
                <i class="fas fa-phone"></i>
            </button>
        ` : `
            <button class="popup-btn popup-btn-secondary" disabled style="flex: 1; padding: 0.8rem 0.2rem; opacity: 0.3; cursor: not-allowed;">
                <i class="fas fa-phone"></i>
            </button>
        `}
        ${shop.email ? `
            <button class="popup-btn popup-btn-secondary" onclick="window.location.href='mailto:${shop.email}'" style="flex: 1; padding: 0.8rem 0.2rem;">
                <i class="fas fa-envelope"></i>
            </button>
        ` : `
            <button class="popup-btn popup-btn-secondary" disabled style="flex: 1; padding: 0.8rem 0.2rem; opacity: 0.3; cursor: not-allowed;">
                <i class="fas fa-envelope"></i>
            </button>
        `}
        ${shop.web ? `
            <button class="popup-btn popup-btn-secondary" onclick="window.open('${shop.web.startsWith('http') ? shop.web : 'https://' + shop.web}', '_blank')" style="flex: 1; padding: 0.8rem 0.2rem;">
                <i class="fas fa-globe"></i>
            </button>
        ` : `
            <button class="popup-btn popup-btn-secondary" disabled style="flex: 1; padding: 0.8rem 0.2rem; opacity: 0.3; cursor: not-allowed;">
                <i class="fas fa-globe"></i>
            </button>
        `}
        <button class="popup-btn popup-btn-secondary" onclick="window.open('https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((shop.adreca || '') + ' ' + (shop.municipi || '') + ' ' + (shop.comarca || ''))}', '_blank')" style="flex: 1; padding: 0.8rem 0.2rem;">
            <i class="fas fa-directions"></i>
        </button>
    </div>
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
    
    // AFEGIR AQUESTA LÍNIA DE DEBUG:
    console.log('All shops before filter:', allShops.length);
    
    const filtered = allShops.filter(shop => 
        checkedCategories.includes(shop.producte1_categoria) ||
        checkedCategories.includes(shop.producte2_categoria)
    );
    
    // AFEGIR AQUESTA LÍNIA DE DEBUG:
    console.log('Filtered shops:', filtered.length);
    console.log('Catalunya Nord shops in filtered:', filtered.filter(s => s.comarca === 'Catalunya Nord').length);
    
    addMarkersToMap(filtered);
}

// Mostrar detalls del comerç
function showShopDetails(index) {
    const shop = allShops[index];
    if (!shop) {
        console.error('Shop not found at index:', index);
        return;
    }
    
    const modal = document.getElementById('shop-modal');
    const headerContent = document.getElementById('modal-header-content');
    const bodyContent = document.getElementById('modal-body');
    
    if (!modal || !headerContent || !bodyContent) {
        console.error('Modal elements not found');
        return;
    }
   headerContent.innerHTML = `
    <h2>${shop.nom}</h2>
    ${shop.descripcio_comerc ? `
        <p style="margin-top: 1rem; font-size: 1.1rem; opacity: 0.9; font-style: italic;">
            ${shop.descripcio_comerc}
        </p>
    ` : ''}
    <p style="margin-top: 1.5rem;"><i class="fas fa-map-marker-alt"></i> ${shop.municipi}${shop.comarca ? ', ' + shop.comarca : ''}</p>
`; 

    
    bodyContent.innerHTML = `
    <div style="margin-bottom: 2rem;">
            ${shop.adreca || shop.municipi ? `<p><strong>Adreça:</strong> ${(shop.adreca || '') + ' ' + (shop.municipi || '') + (shop.comarca ? ', ' + shop.comarca : '')}</p>` : ''}
            ${shop.telefon ? `<p><strong>Telèfon:</strong> <a href="tel:${shop.telefon}" style="color: var(--accent-color); text-decoration: none;">${shop.telefon}</a></p>` : ''}
            ${shop.email ? `<p><strong>Email:</strong> <a href="mailto:${shop.email}" style="color: var(--accent-color); text-decoration: none;">${shop.email}</a></p>` : ''}
            ${shop.web ? `<p><strong>Web:</strong> <a href="${shop.web.startsWith('http') ? shop.web : 'https://' + shop.web}" target="_blank" style="color: var(--accent-color); text-decoration: none;">${shop.web}</a></p>` : ''}
        </div>
        
        <h3 style="margin-bottom: 1.5rem; color: var(--primary-color); border-bottom: 2px solid var(--border-color); padding-bottom: 0.5rem;">Productes destacats</h3>
        
        ${shop.producte1_nom ? `
            <div class="product-showcase" style="margin-bottom: 2rem;">
                <div class="product-content${!shop.producte1_foto ? ' no-image' : ''}">
                    <div class="product-info">
                        <h4 style="margin-bottom: 1rem; color: var(--primary-color); font-size: 1.3rem; font-weight: 600;">
                            ${shop.producte1_nom}
                        </h4>
                        <p style="margin-bottom: 0.8rem;"><strong>Categoria:</strong> <span style="color: var(--accent-color);">${shop.producte1_categoria}</span></p>
                        ${shop.producte1_descripcio ? `<p style="color: var(--text-light); line-height: 1.6;">${shop.producte1_descripcio}</p>` : ''}
                        ${shop.producte1_preu ? `<span class="product-price" style="margin-top: 1rem; display: inline-block;">${shop.producte1_preu}</span>` : ''}
                    </div>
                    ${shop.producte1_foto ? `
                        <img src="${shop.producte1_foto}" 
                             alt="${shop.producte1_nom}" 
                             style="width: 140px; height: 105px; border-radius: 10px; object-fit: cover; cursor: pointer; box-shadow: var(--shadow-medium); border: 2px solid white; transition: var(--transition);"
                             onclick="openImageModal('${shop.producte1_foto}', '${shop.producte1_nom}')"
                             onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='var(--shadow-heavy)';"
                             onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='var(--shadow-medium)';">
                    ` : ''}
                </div>
            </div>
        ` : ''}
        
        ${shop.producte2_nom ? `
            <div class="product-showcase">
                <div class="product-content${!shop.producte2_foto ? ' no-image' : ''}">
                    <div class="product-info">
                        <h4 style="margin-bottom: 1rem; color: var(--primary-color); font-size: 1.3rem; font-weight: 600;">
                            ${shop.producte2_nom}
                        </h4>
                        <p style="margin-bottom: 0.8rem;"><strong>Categoria:</strong> <span style="color: var(--accent-color);">${shop.producte2_categoria}</span></p>
                        ${shop.producte2_descripcio ? `<p style="color: var(--text-light); line-height: 1.6;">${shop.producte2_descripcio}</p>` : ''}
                        ${shop.producte2_preu ? `<span class="product-price" style="margin-top: 1rem; display: inline-block;">${shop.producte2_preu}</span>` : ''}
                    </div>
                    ${shop.producte2_foto ? `
                        <img src="${shop.producte2_foto}" 
                             alt="${shop.producte2_nom}" 
                             style="width: 140px; height: 105px; border-radius: 10px; object-fit: cover; cursor: pointer; box-shadow: var(--shadow-medium); border: 2px solid white; transition: var(--transition);"
                             onclick="openImageModal('${shop.producte2_foto}', '${shop.producte2_nom}')"
                             onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='var(--shadow-heavy)';"
                             onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='var(--shadow-medium)';">
                    ` : ''}
                </div>
            </div>
        ` : ''}
    `;
    
    modal.style.display = 'block';
}

// Obrir modal d'imatge
function openImageModal(imageSrc, caption) {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-image');
    const modalCaption = document.getElementById('modal-caption');
    
    if (modal && modalImg && modalCaption) {
        modal.style.display = 'block';
        modalImg.src = imageSrc;
        modalCaption.textContent = caption;
        
        modalImg.onerror = function() {
            modalCaption.textContent = 'Error carregant la imatge';
            modalImg.style.display = 'none';
        };
        
        modalImg.onload = function() {
            modalImg.style.display = 'block';
        };
    }
}
