// Configuració de Google Sheets
const CONFIG = {
    // Substitueix aquest ID pel teu ID de Google Sheets
    // Per obtenir l'ID: obre el teu Google Sheet i copia l'ID de la URL
    // https://docs.google.com/spreadsheets/d/[AQUEST_ES_L'ID]/edit
    SHEET_ID: '1R3d3uiYIgl3eP8afyE3i08OuQTb8A_CiXebegBMFsUo',
    
    // Nom del full (pestanya) dins del Google Sheet
    SHEET_NAME: 'Comercos',
    
    // Centre del mapa (Catalunya)
    MAP_CENTER: [41.8204, 1.8676],
    MAP_ZOOM: 8,
    
    // Estils dels marcadors per categoria
    MARKER_COLORS: {
        'Carn': '#8B0000',
        'Elaboradors': '#FF6347',
        'Embotits': '#DC143C',
        'Begudes': '#4B0082',
        'Formatges': '#FFD700',
        'Oli': '#808000',
        'Pa': '#D2691E',
        'Peix': '#4682B4',
        'Llegums': '#228B22',
        'Pastes': '#F4A460',
        'Fruita seca': '#8B4513',
        'Fruita fresca': '#32CD32',
        'Mel': '#FFA500',
        'Restauració': '#800080',
        'default': '#696969'
    },
    
    // Icones per categoria (Font Awesome)
    CATEGORY_ICONS: {
        'Carn': 'fa-drumstick-bite',
        'Elaboradors': 'fa-utensils',
        'Embotits': 'fa-bacon',
        'Begudes': 'fa-wine-bottle',
        'Formatges': 'fa-cheese',
        'Oli': 'fa-bottle-droplet',
        'Pa': 'fa-bread-slice',
        'Peix': 'fa-fish',
        'Llegums': 'fa-seedling',
        'Pastes': 'fa-wheat-awn',
        'Fruita seca': 'fa-circle',
        'Fruita fresca': 'fa-apple-whole',
        'Mel': 'fa-jar',
        'Restauració': 'fa-store',
        'default': 'fa-shopping-basket'
    }
};

// Llista de comarques de Catalunya
const COMARQUES = [
    'Alt Camp',
    'Alt Empordà',
    'Alt Penedès',
    'Alt Urgell',
    'Alta Ribagorça',
    'Anoia',
    'Aran',
    'Bages',
    'Baix Camp',
    'Baix Ebre',
    'Baix Empordà',
    'Baix Llobregat',
    'Baix Penedès',
    'Barcelonès',
    'Berguedà',
    'Cerdanya',
    'Conca de Barberà',
    'Garraf',
    'Garrigues',
    'Garrotxa',
    'Gironès',
    'Maresme',
    'Moianès',
    'Montsià',
    'Noguera',
    'Osona',
    'Pallars Jussà',
    'Pallars Sobirà',
    'Pla de l\'Estany',
    'Pla d\'Urgell',
    'Priorat',
    'Ribera d\'Ebre',
    'Ripollès',
    'Segarra',
    'Segrià',
    'Selva',
    'Solsonès',
    'Tarragonès',
    'Terra Alta',
    'Urgell',
    'Vallès Occidental',
    'Vallès Oriental'
];