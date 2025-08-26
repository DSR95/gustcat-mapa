export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const SHEET_ID = process.env.GOOGLE_SHEET_ID;
    const SHEET_NAME = process.env.GOOGLE_SHEET_NAME;
    
    if (!SHEET_ID || !SHEET_NAME) {
      throw new Error('Missing environment variables');
    }

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
    
    const shops = await processShopsData(data);
    
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
      lat: null,
      lng: null
    }));

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
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
    
const actiu = getCellValue(0);
const nom = getCellValue(1);
    
    const isActive = actiu === 'Sí' || actiu === 'En seguiment';
    
    if (nom && isActive) {
  const shop = {
  nom: nom,
  comarca: getCellValue(15), // abans era 14
  municipi: getCellValue(14), // abans era 13
  adreca: getCellValue(12),   // abans era 11
  codi_postal: getCellValue(13), // abans era 12
  telefon: getCellValue(16),  // abans era 15
  email: getCellValue(17),    // abans era 16
  web: getCellValue(18),      // abans era 17
  descripcio_comerc: getCellValue(3), // abans era 2
  producte1_nom: getCellValue(4),     // abans era 3
  producte1_categoria: getCellValue(5), // abans era 4
  producte1_descripcio: getCellValue(7), // abans era 6
  producte1_foto: convertGoogleDriveUrl(getCellValue(6)), // abans era 5
  producte2_nom: getCellValue(8),     // abans era 7
  producte2_categoria: getCellValue(9), // abans era 8
  producte2_descripcio: getCellValue(11), // abans era 10
  producte2_foto: convertGoogleDriveUrl(getCellValue(10)), // abans era 9
  lat: null,
  lng: null
};
      
      shops.push(shop);
    }
  }
  
  return shops;
}

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
