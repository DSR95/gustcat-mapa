// FUNCIÓ SHOWTAB
function showTab(tabName) {
    console.log('Changing to tab:', tabName);
    
    // Amagar tots els tabs
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Eliminar active de tots els links de navegació
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active');
    });
    
    // Mostrar el tab seleccionat
    const selectedContent = document.getElementById(`content-${tabName}`);
    if (selectedContent) {
        selectedContent.classList.add('active');
        console.log('Tab content shown:', `content-${tabName}`);
    } else {
        console.error('Tab content not found:', `content-${tabName}`);
    }
    
    // Activar el link corresponent
    const selectedLink = document.getElementById(`tab-${tabName}`);
    if (selectedLink) {
        selectedLink.classList.add('active');
        console.log('Tab link activated:', `tab-${tabName}`);
    }
    
    // Si és el mapa, inicialitzar-lo i ajustar la mida
    if (tabName === 'mapa') {
        setTimeout(() => {
            if (map) {
                map.invalidateSize();
                console.log('Map size invalidated');
                
                // Si hi ha marcadors, ajustar la vista
                if (markers.length > 0) {
                    const group = new L.featureGroup(markers);
                    map.fitBounds(group.getBounds().pad(0.1));
                    console.log('Map bounds fitted to markers');
                }
            } else {
                console.log('Map not initialized yet, initializing...');
                initMap();
            }
        }, 100);
    }
}

// Inicialització
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    
    // Esperar que Leaflet es carregui
    if (typeof L === 'undefined') {
        console.log('Leaflet not ready, waiting...');
        setTimeout(() => {
            initializeApp();
        }, 1000);
    } else {
        console.log('Leaflet ready, initializing app...');
        initializeApp();
    }
});

function initializeApp() {
    try {
        initMap();
        loadShopsFromGoogleSheets();
        setupEventListeners();
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

// Inicialitzar mapa
function initMap() {
    try {
        if (typeof L === 'undefined') {
            throw new Error('Leaflet not loaded');
        }
        
        console.log('Initializing map...');
        map = L.map('map').setView(CONFIG.MAP_CENTER, CONFIG.MAP_ZOOM);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        console.log('Map initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing map:', error);
        document.getElementById('map').innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: var(--bg-cream); color: var(--text-light);">
                <div style="text-align: center;">
                    <i class="fas fa-map-marked-alt" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <h3>Error carregant el mapa</h3>
                    <p>Prova actualitzar la pàgina</p>
                </div>
            </div>
        `;
        return false;
    }
}

// Geocodificar adreça - VERSIÓ CORREGIDA
async function geocodeAddress(address) {
    if (geocodeCache.has(address)) {
        return geocodeCache.get(address);
    }
    
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
        const data = await response.json();
        
        if (data && data.length > 0) {
            const coords = {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            };
            geocodeCache.set(address, coords);
            await new Promise(resolve => setTimeout(resolve, 100)); // Rate limiting
            return coords;
        }
    } catch (error) {
        console.error('Error geocoding:', error);
    }
    
    // CORRECCIÓ: Determinar si és Catalunya Nord o Sud per les coordenades aleatòries
    const isCatalunyaNord = address.toLowerCase().includes('france') || 
                           address.toLowerCase().includes('francia') ||
                           address.toLowerCase().includes('catalunya nord');
    
    let randomCoords;
    if (isCatalunyaNord) {
        // Coordenades per Catalunya Nord (França)
        randomCoords = {
            lat: 42.3 + Math.random() * 0.5,  // Entre Perpinyà i la frontera
            lng: 2.7 + Math.random() * 0.6    // Pirineus Orientals
        };
    } else {
        // Coordenades per Catalunya Sud (Espanya) 
        randomCoords = {
            lat: 41.5 + Math.random() * 1.5,
            lng: 0.5 + Math.random() * 2.5
        };
    }
    
    geocodeCache.set(address, randomCoords);
    return randomCoords;
}

// Funció per convertir enllaços de Google Drive
function convertGoogleDriveUrl(url) {
    if (!url) return '';
    
    if (url.includes('drive.google.com/uc?id=')) {
        return url;
    }
    
    if (url.includes('drive.google.com/file/d/')) {
        const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (match) {
            const fileId = match[1];
            const directUrl = `https://drive.google.com/uc?id=${fileId}`;
            console.log(`Converted Google Drive URL: ${url} → ${directUrl}`);
            return directUrl;
        }
    }
    
    return url;
}
