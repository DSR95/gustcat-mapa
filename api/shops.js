export default async function handler(req, res) {
  // Només permetre GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const SHEET_ID = process.env.GOOGLE_SHEET_ID;
    const SHEET_NAME = process.env.GOOGLE_SHEET_NAME;
    
    if (!SHEET_ID || !SHEET_NAME) {
      throw new Error('Missing environment variables');
    }

    // Llegir Google Sheet
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    if (!text.includes('google.visualization.Query.setResponse')) {
      throw new Error('Invalid Google Sheets response format');
    }
    
    const jsonString = text.substring(47).slice(0, -2);
    const data = JSON.parse(jsonString);
    
    // Processar les dades
    const shops = await processShopsData(data);
    
    // Filtrar només dades públiques
    const publicShops = shops.map(shop => ({
      nom: shop.nom,
      comarca: shop.comarca,
      municipi: shop.municipi,
      adreca: shop.adreca,
      codi_postal: shop.codi_postal,
      telefon: shop.telefon,
      email: shop.email,
      web: shop.web,
      descripcio_comerc: shop.descripcio_comerc,
      producte1_nom: shop.producte1_nom,
      producte1_categoria: shop.producte1_categoria,
      producte1_descripcio: shop.producte1_descripcio,
      producte1_foto: shop.producte1_foto,
      producte2_nom: shop.producte2_nom,
      producte2_categoria: shop.producte2_categoria,
      producte2_descripcio: shop.producte2_descripcio,
      producte2_foto: shop.producte2_foto,
      lat: shop.lat,
      lng: shop.lng
    }));

    // Configurar headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Retornar dades
    res.status(200).json({
      success: true,
      count: publicShops.length,
      shops: publicShops
    });

  } catch (error) {
    console.error('Error fetching shops:', error);
    res.status(500).json({ 
      error: 'Failed to fetch shops',
      message: error.message 
    });
  }
}

// Funció per processar dades (copiada del teu codi actual)
async function processShopsData(data) {
  if (!data.table || !data.table.rows) {
    throw new Error('Invalid Google Sheets data structure');
  }
  
  const rows = data.table.rows;
  const shops = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    
    if (!row.c || row.c.length === 0) {
      continue;
    }
    
    const getCellValue = (index) => {
      if (row.c[index] && row.c[index].v !== null && row.c[index].v !== undefined) {
        return row.c[index].v.toString().trim();
      }
      return '';
    };
    
    const nom = getCellValue(0);
    const actiu = getCellValue(18);
    
    // Només incloure comerços actius
    const isActive = actiu === 'Sí' || actiu === 'En seguiment';
    
    if (nom && isActive) {
      const shop = {
        nom: nom,
        comarca: getCellValue(14),
        municipi: getCellValue(13),
        adreca: getCellValue(11),
        codi_postal: getCellValue(12),
        telefon: getCellValue(15),
        email: getCellValue(16),
        web: getCellValue(17),
        descripcio_comerc: getCellValue(2),
        producte1_nom: getCellValue(3),
        producte1_categoria: getCellValue(4),
        producte1_descripcio: getCellValue(6),
        producte1_foto: convertGoogleDriveUrl(getCellValue(5)),
        producte2_nom: getCellValue(7),
        producte2_categoria: getCellValue(8),
        producte2_descripcio: getCellValue(10),
        producte2_foto: convertGoogleDriveUrl(getCellValue(9)),
        lat: null,
        lng: null
      };
      
      // Geocodificar adreça
      const fullAddress = `${shop.adreca} ${shop.codi_postal} ${shop.municipi}, Spain`.trim();
      const coords = await geocodeAddress(fullAddress || `${shop.municipi}, Spain`);
      if (coords) {
        shop.lat = coords.lat;
        shop.lng = coords.lng;
      }
      
      shops.push(shop);
    }
  }
  
  return shops;
}

// Funcions auxiliars
function convertGoogleDriveUrl(url) {
  if (!url) return '';
  
  if (url.includes('drive.google.com/uc?id=')) {
    return url;
  }
  
  if (url.includes('drive.google.com/file/d/')) {
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match) {
      const fileId = match[1];
      return `https://drive.google.com/uc?id=${fileId}`;
    }
  }
  
  return url;
}

const geocodeCache = new Map();

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
      await new Promise(resolve => setTimeout(resolve, 100));
      return coords;
    }
  } catch (error) {
    console.error('Error geocoding:', error);
  }
  
  const randomCoords = {
    lat: 41.5 + Math.random() * 1.5,
    lng: 0.5 + Math.random() * 2.5
  };
  geocodeCache.set(address, randomCoords);
  return randomCoords;
}
