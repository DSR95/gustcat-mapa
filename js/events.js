// Configurar event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Cerca en temps real
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(applyFilters, 300);
        });
    }
    
    // Filtres
    const comarcaFilter = document.getElementById('comarca-filter');
    const municipiFilter = document.getElementById('municipi-filter');
    const categoriaFilter = document.getElementById('categoria-filter');
    
    if (comarcaFilter) comarcaFilter.addEventListener('change', applyFilters);
    if (municipiFilter) municipiFilter.addEventListener('change', applyFilters);
    if (categoriaFilter) categoriaFilter.addEventListener('change', applyFilters);
    
    // Modal de comerç
    const modal = document.getElementById('shop-modal');
    const closeBtn = document.querySelector('.close');
    
    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.style.display = 'none';
        }
    }
    
    // Modal d'imatge
    const imageModal = document.getElementById('image-modal');
    const imageCloseBtn = document.querySelector('.image-modal-close');
    
    if (imageCloseBtn) {
        imageCloseBtn.onclick = function() {
            imageModal.style.display = 'none';
        }
    }
    
    // Tancar modals fent clic fora
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
        if (event.target == imageModal) {
            imageModal.style.display = 'none';
        }
    }
    
    // Formulari de registre
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmit);
    }
    
    // Event listeners per filtres del mapa
    document.querySelectorAll('#categoryFilters input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            setTimeout(applyMapFilters, 100);
        });
    });
    
    console.log('Event listeners set up successfully');
}

// Gestionar enviament del formulari
async function handleRegisterSubmit(e) {
    e.preventDefault();
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    
    // Mostrar estat de carregament
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviant...';
    submitButton.disabled = true;
    
    try {
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        console.log('Enviant sol·licitud:', data);
        
        const response = await fetch('/api/send-contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            showSuccessMessage('Sol·licitud enviada correctament! Ens posarem en contacte aviat.');
            e.target.reset();
            
            setTimeout(() => {
                showTab('inici');
            }, 3000);
        } else {
            throw new Error(result.message || 'Error enviant la sol·licitud');
        }
        
    } catch (error) {
        console.error('Error:', error);
        showErrorMessage('Error enviant la sol·licitud. Proveu de nou més tard.');
    } finally {
        // Restaurar botó
        submitButton.innerHTML = originalButtonText;
        submitButton.disabled = false;
    }
}

// Mostrar missatges
function showSuccessMessage(message) {
    showMessage(message, 'success');
}

function showErrorMessage(message) {
    showMessage(message, 'error');
}

function showMessage(message, type) {
    const existingMessage = document.querySelector('.success-message, .error-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${message}
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        if (messageDiv && messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Mostrar/amagar spinner
function showLoadingSpinner() {
    const container = document.getElementById('shops-container');
    if (container) {
        container.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                Carregant comerços...
            </div>
        `;
    }
}

function hideLoadingSpinner() {
    // El spinner s'elimina automàticament quan es mostren els comerços
}

// Funcions de debug
function debugInfo() {
    console.log('=== DEBUG INFO ===');
    console.log('Map object:', map);
    console.log('All shops:', allShops.length);
    console.log('Filtered shops:', filteredShops.length);
    console.log('Markers:', markers.length);
    console.log('Current tab:', document.querySelector('.tab-content.active')?.id);
    console.log('==================');
}

// Exposar funcions globals per debug
window.gustcatDebug = {
    showTab,
    map: () => map,
    shops: () => allShops,
    debugInfo
};

// Gestió d'errors globals
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    
    if (e.error && e.error.message && e.error.message.includes('map')) {
        showErrorMessage('Error amb el mapa. Prova actualitzar la pàgina.');
    }
});

// Detectar quan la pàgina està completament carregada
window.addEventListener('load', function() {
    console.log('Page fully loaded');
    
    setTimeout(() => {
        if (!map) {
            console.warn('Map still not initialized, retrying...');
            initMap();
        }
        
        if (allShops.length === 0) {
            console.warn('No shops loaded from Google Sheets, loading sample data...');
            allShops = getSampleData();
            filteredShops = [...allShops];
            updateFilters();
            displayShops(filteredShops);
            addMarkersToMap(filteredShops);
            updateResultsCount();
        } else {
            console.log(`Real data already loaded: ${allShops.length} shops`);
        }
    }, 3000);
});
