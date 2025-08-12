// Variables globals
let map;
let markers = [];
let allShops = [];
let filteredShops = [];

// Inicialització quan es carrega la pàgina
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    loadShopsFromGoogleSheets();
    setupEventListeners();
});

// Inicialitzar el mapa
function initMap() {
    // Crear el mapa centrat a Catalunya
    map = L.map('map').setView(CONFIG.MAP_CENTER, CONFIG.MAP_ZOOM);
    
    // Afegir capa de tiles d'OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

// Carregar dades de Google Sheets
async function loadShopsFromGoogleSheets() {
    try {
        // Construir URL de l'API de Google Sheets
        const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.SHEET_NAME}`;
        
        const response = await fetch(url);
        const text = await response.text();
        
        // Parsejar la resposta (Google retorna JSONP)
        const jsonString = text.substring(47).slice(0, -2);
        const data = JSON.parse(jsonString);
        
        // Processar les dades
        allShops = processGoogleSheetsData(data);
        filteredShops = [...allShops];
        
        // Actualitzar interfície
        updateFilters();
        displayShops(filteredShops);
        addMarkersToMap(filteredShops);
        
    } catch (error) {
        console.error('Error carregant dades:', error);
        document.getElementById('shops-container').innerHTML = 
            '<div class="error">Error carregant les dades. Si us plau, comprova la configuració.</div>';
    }
}

// Processar dades de Google Sheets
function processGoogleSheetsData(data) {
    const shops = [];
    const rows = data.table.rows;
    
    // Saltar la primera fila si és capçalera
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i].c;
        
        // Comprovar que la fila té dades i està activa
        if (row && row[12] && row[12].v === 'SI') {
            shops.push({
                name: row[0]?.v || '',
                category: row[1]?.v || '',
                product1: row[2]?.v || '',
                product2: row[3]?.v || '',
                description: row[4]?.v || '',
                municipality: row[5]?.v || '',
                comarca: row[6]?.v || '',
                lat: parseFloat(row[7]?.v) || 0,
                lng: parseFloat(row[8]?.v) || 0,
                phone: row[9]?.v || '',
                email: row[10]?.v || '',
                web: row[11]?.v || ''
            });
        }
    }
    
    return shops;
}

// Actualitzar opcions dels filtres
function updateFilters() {
    // Obtenir valors únics
    const comarques = [...new Set(allShops.map(shop => shop.comarca))].sort();
    const municipis = [...new Set(allShops.map(shop => shop.municipality))].sort();
    
    // Actualitzar select de comarques
    const comarcaSelect = document.getElementById('comarca-filter');
    comarcaSelect.innerHTML = '<option value="">Totes les comarques</option>';
    comarques.forEach(comarca => {
        if (comarca) {
            comarcaSelect.innerHTML += `<option value="${comarca}">${comarca}</option>`;
        }
    });
    
    // Actualitzar select de municipis
    const municipiSelect = document.getElementById('municipi-filter');
    municipiSelect.innerHTML = '<option value="">Tots els municipis</option>';
    municipis.forEach(municipi => {
        if (municipi) {
            municipiSelect.innerHTML += `<option value="${municipi}">${municipi}</option>`;
        }
    });
}

// Mostrar comerços a la llista
function displayShops(shops) {
    const container = document.getElementById('shops-container');
    
    if (shops.length === 0) {
        container.innerHTML = '<div class="no-results">No s\'han trobat comerços amb aquests filtres.</div>';
        return;
    }
    
    container.innerHTML = shops.map(shop => `
        <div class="shop-card" onclick="showShopDetails('${encodeURIComponent(JSON.stringify(shop))}')">
            <h3>${shop.name}</h3>
            <div class="shop-category">${shop.category}</div>
            <div class="shop-location">
                <i class="fas fa-map-marker-alt"></i> ${shop.municipality}, ${shop.comarca}
            </div>
            <div class="shop-products">
                ${shop.product1 ? `<span class="product-tag">${shop.product1}</span>` : ''}
                ${shop.product2 ? `<span class="product-tag">${shop.product2}</span>` : ''}
            </div>
        </div>
    `).join('');
}

// Afegir marcadors al mapa
function addMarkersToMap(shops) {
    // Eliminar marcadors existents
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    // Crear grup de marcadors per ajustar la vista
    const group = new L.featureGroup();
    
    shops.forEach(shop => {
        if (shop.lat && shop.lng) {
            // Obtenir color segons categoria
            const color = CONFIG.MARKER_COLORS[shop.category] || CONFIG.MARKER_COLORS.default;
            
            // Crear icona personalitzada
            const icon = L.divIcon({
                html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center;">
                    <i class="fas ${CONFIG.CATEGORY_ICONS[shop.category] || CONFIG.CATEGORY_ICONS.default}" style="color: white; font-size: 14px;"></i>
                </div>`,
                className: 'custom-marker',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });
            
            // Crear marcador
            const marker = L.marker([shop.lat, shop.lng], { icon: icon });
            
            // Afegir popup
            const popupContent = `
                <div class="popup-content">
                    <h3>${shop.name}</h3>
                    <div class="category">${shop.category}</div>
                    <div>${shop.municipality}, ${shop.comarca}</div>
                    <div class="products">
                        <strong>Productes estrella:</strong><br>
                        ${shop.product1 ? `• ${shop.product1}<br>` : ''}
                        ${shop.product2 ? `• ${shop.product2}` : ''}
                    </div>
                    <a href="#" class="btn-details" onclick="showShopDetails('${encodeURIComponent(JSON.stringify(shop))}'); return false;">
                        Més detalls
                    </a>
                </div>
            `;
            
            marker.bindPopup(popupContent);
            marker.addTo(map);
            markers.push(marker);
            group.addLayer(marker);
        }
    });
    
    // Ajustar vista del mapa si hi ha marcadors
    if (markers.length > 0) {
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

// Mostrar detalls del comerç al modal
function showShopDetails(shopJson) {
    const shop = JSON.parse(decodeURIComponent(shopJson));
    const modal = document.getElementById('shop-modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `
        <h2>${shop.name}</h2>
        <div class="shop-category" style="margin: 1rem 0;">${shop.category}</div>
        
        ${shop.description ? `<p style="margin: 1rem 0;">${shop.description}</p>` : ''}
        
        <div style="margin: 1.5rem 0;">
            <h3 style="color: var(--primary-color); margin-bottom: 0.5rem;">Productes Estrella</h3>
            ${shop.product1 ? `<div style="margin: 0.5rem 0;">• ${shop.product1}</div>` : ''}
            ${shop.product2 ? `<div style="margin: 0.5rem 0;">• ${shop.product2}</div>` : ''}
        </div>
        
        <div style="margin: 1.5rem 0;">
            <h3 style="color: var(--primary-color); margin-bottom: 0.5rem;">Ubicació</h3>
            <p>${shop.municipality}, ${shop.comarca}</p>
        </div>
        
        <div style="margin: 1.5rem 0;">
            <h3 style="color: var(--primary-color); margin-bottom: 0.5rem;">Contacte</h3>
            ${shop.phone ? `<p><i class="fas fa-phone"></i> ${shop.phone}</p>` : ''}
            ${shop.email ? `<p><i class="fas fa-envelope"></i> ${shop.email}</p>` : ''}
            ${shop.web ? `<p><i class="fas fa-globe"></i> <a href="${shop.web}" target="_blank">${shop.web}</a></p>` : ''}
        </div>
    `;
    
    modal.style.display = 'block';
}

// Configurar event listeners
function setupEventListeners() {
    // Filtres
    document.getElementById('comarca-filter').addEventListener('change', applyFilters);
    document.getElementById('municipi-filter').addEventListener('change', applyFilters);
    document.getElementById('categoria-filter').addEventListener('change', applyFilters);
    document.getElementById('reset-filters').addEventListener('click', resetFilters);
    
    // Modal
    const modal = document.getElementById('shop-modal');
    const closeBtn = document.querySelector('.close');
    
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }
    
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
    
    // Actualitzar municipis quan es canvia la comarca
    document.getElementById('comarca-filter').addEventListener('change', function() {
        updateMunicipiFilter(this.value);
    });
}

// Actualitzar filtre de municipis segons comarca
function updateMunicipiFilter(selectedComarca) {
    const municipiSelect = document.getElementById('municipi-filter');
    
    if (selectedComarca) {
        // Filtrar municipis de la comarca seleccionada
        const municipis = [...new Set(
            allShops
                .filter(shop => shop.comarca === selectedComarca)
                .map(shop => shop.municipality)
        )].sort();
        
        municipiSelect.innerHTML = '<option value="">Tots els municipis</option>';
        municipis.forEach(municipi => {
            if (municipi) {
                municipiSelect.innerHTML += `<option value="${municipi}">${municipi}</option>`;
            }
        });
    } else {
        // Mostrar tots els municipis
        updateFilters();
    }
}

// Aplicar filtres
function applyFilters() {
    const comarca = document.getElementById('comarca-filter').value;
    const municipi = document.getElementById('municipi-filter').value;
    const categoria = document.getElementById('categoria-filter').value;
    
    filteredShops = allShops.filter(shop => {
        return (!comarca || shop.comarca === comarca) &&
               (!municipi || shop.municipality === municipi) &&
               (!categoria || shop.category === categoria);
    });
    
    displayShops(filteredShops);
    addMarkersToMap(filteredShops);
}

// Restablir filtres
function resetFilters() {
    document.getElementById('comarca-filter').value = '';
    document.getElementById('municipi-filter').value = '';
    document.getElementById('categoria-filter').value = '';
    
    filteredShops = [...allShops];
    displayShops(filteredShops);
    addMarkersToMap(filteredShops);
    updateFilters();
}

// Recarregar dades cada 5 minuts
setInterval(loadShopsFromGoogleSheets, 5 * 60 * 1000);