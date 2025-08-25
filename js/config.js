// Variables globals
let map;
let markers = [];
let allShops = [];
let filteredShops = [];
let geocodeCache = new Map();
let currentViewMode = 'grid';
let searchTimeout;

// Configuració - EMOJIS ACTUALITZATS
const CONFIG = {
    SHEET_ID: '1sR3obYw4gI9LguXt3__a6TaVweQN8vzLvVfEon37JPI',
    SHEET_NAME: 'Full 1',
    MAP_CENTER: [41.8204, 1.8676],
    MAP_ZOOM: 8,
    CATEGORY_EMOJIS: {
        'Carn (engreix: xai, vedella, porc, aviram)': '🐄',
        'Elaboradors alimentaris (cuinats i conserves)': '🥫',
        'Embotits propis': '🥓',
        'Begudes artesanes (vi, cava, licors, cerveses)': '🍷',
        'Formatges i làctics': '🧀',
        'Oli i olives': '🫒',
        'Pa, pastissos': '🍞',
        'Peix, marisc': '🐟',
        'Llegums': '🌾',
        'Pastes, arròs, cereals': '🌾',
        'Fruita seca': '🥜',
        'Fruita i verdures fresques': '🍎',
        'Mel i condiments aromàtics': '🍯',
        'Restauració': '🍽️',
        'default': '🏪'
    }
};

// Obtenir emoji de categoria
function getCategoryEmoji(category) {
    return CONFIG.CATEGORY_EMOJIS[category] || CONFIG.CATEGORY_EMOJIS.default;
}
