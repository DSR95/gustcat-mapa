async function loadShopsFromGoogleSheets() {
    try {
        console.log('Loading shops from secure API...');
        showLoadingSpinner();
        
        const response = await fetch('/api/shops');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Received data from API:', data);
        
        if (!data.success || !data.shops) {
            throw new Error('Invalid API response format');
        }
        
        allShops = data.shops;
        
        if (allShops.length === 0) {
            throw new Error('No valid shops found');
        }
        
for (let shop of allShops) {
    if (!shop.lat || !shop.lng) {
        const country = (shop.comarca === 'Catalunya Nord') ? 'France' : 'Spain';
        const fullAddress = `${shop.adreca} ${shop.codi_postal} ${shop.municipi}, ${country}`.trim();
        const coords = await geocodeAddress(fullAddress || `${shop.municipi}, ${country}`);
        if (coords) {
            shop.lat = coords.lat;
            shop.lng = coords.lng;
        }
    }
}
        
        filteredShops = [...allShops];
        
        updateFilters();
        displayShops(filteredShops);
        addMarkersToMap(filteredShops);
        updateResultsCount();
        
        hideLoadingSpinner();
        showSuccessMessage(`${allShops.length} comerços carregats correctament`);
        
    } catch (error) {
        console.error('Error loading shops data:', error);
        console.log('Fallback: Using sample data...');
        
        allShops = getSampleData();
        filteredShops = [...allShops];
        
        updateFilters();
        displayShops(filteredShops);
        addMarkersToMap(filteredShops);
        updateResultsCount();
        
        hideLoadingSpinner();
        showErrorMessage('Error carregant dades. Mostrant dades de mostra.');
    }
}

async function processGoogleSheetsData(data) {
    console.log('Raw Google Sheets data:', data);
    
    if (!data.table || !data.table.rows) {
        throw new Error('Invalid Google Sheets data structure');
    }
    
    const rows = data.table.rows;
    const shops = [];
    
if (rows[0] && rows[0].c) {
    const headers = rows[0].c.map((cell, index) => `${index}: ${cell?.v || 'empty'}`);
    console.log('Sheet headers with indices:', headers);
}

if (rows[1] && rows[1].c) {
    const firstRow = rows[1].c.map((cell, index) => `${index}: ${cell?.v || 'empty'}`);
    console.log('First data row:', firstRow);
}
    
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        
        if (!row.c || row.c.length === 0) {
            console.log(`Skipping empty row ${i}`);
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
const logo_comerc = getCellValue(2);
const descripcio_comerc = getCellValue(3);
const producte1_nom = getCellValue(4);
const producte1_categoria = getCellValue(5);
const producte1_foto_raw = getCellValue(6);
const producte1_descripcio = getCellValue(7);
const producte2_nom = getCellValue(8);
const producte2_categoria = getCellValue(9);
const producte2_foto_raw = getCellValue(10);
const producte2_descripcio = getCellValue(11);
const adreca = getCellValue(12);
const codi_postal = getCellValue(13);
const municipi = getCellValue(14);
const comarca = getCellValue(15);
const telefon = getCellValue(16);
const email = getCellValue(17);
const web = getCellValue(18);
const data_alta = getCellValue(19);
const notes_internes = getCellValue(20);
        
        const producte1_foto = convertGoogleDriveUrl(producte1_foto_raw);
        const producte2_foto = convertGoogleDriveUrl(producte2_foto_raw);
        
        console.log(`Row ${i} - Nom: "${nom}", Actiu: "${actiu}", Cat1: "${producte1_categoria}", Cat2: "${producte2_categoria}"`);
        
        const isActive = actiu === 'Sí' || actiu === 'En seguiment';
        
        if (nom && isActive) {
            const shop = {
                nom: nom,
                comarca: comarca,
                municipi: municipi,
                adreca: adreca,
                codi_postal: codi_postal,
                telefon: telefon,
                email: email,
                web: web,
                logo_comerc: logo_comerc,
                descripcio_comerc: descripcio_comerc,
                producte1_nom: producte1_nom,
                producte1_categoria: producte1_categoria,
                producte1_preu: '',
                producte1_descripcio: producte1_descripcio,
                producte1_foto: producte1_foto,
                producte2_nom: producte2_nom,
                producte2_categoria: producte2_categoria,
                producte2_preu: '',
                producte2_descripcio: producte2_descripcio,
                producte2_foto: producte2_foto,
                actiu: actiu,
                data_alta: data_alta,
                notes_internes: notes_internes,
                lat: null,
                lng: null
            };
            
            const country = (comarca === 'Catalunya Nord') ? 'France' : 'Spain';
            const fullAddress = `${adreca} ${codi_postal} ${municipi}, ${country}`.trim();
            const coords = await geocodeAddress(fullAddress || `${municipi}, ${country}`);
            if (coords) {
                shop.lat = coords.lat;
                shop.lng = coords.lng;
            }
            
            shops.push(shop);
            console.log(`Added shop: ${shop.nom} (Status: ${actiu})`);
        } else {
            console.log(`Skipped row ${i} - Name: "${nom}", Active: "${actiu}"`);
        }
    }
    
    console.log(`Total active shops processed: ${shops.length}`);
    return shops;
}

function getSampleData() {
    return [
        {
            nom: "Can Roca - Carnisseria Artesana",
            comarca: "Osona",
            municipi: "Vic",
            adreca: "Plaça Major, 15, 08500 Vic",
            telefon: "938 862 134",
            email: "info@canroca.cat",
            web: "www.canroca.cat",
            producte1_nom: "Llonganissa de Vic IGP",
            producte1_categoria: "Embotits propis",
          
            producte1_descripcio: "Llonganissa artesana amb Indicació Geogràfica Protegida, elaborada segons la recepta tradicional.",
            producte2_nom: "Botifarra de perol",
            producte2_categoria: "Embotits propis",
           
            producte2_descripcio: "Botifarra cuita al perol seguint la recepta de l'àvia.",
            lat: 41.9297,
            lng: 2.2544
        },
        {
            nom: "Formatgeria del Pirineu",
            comarca: "Cerdanya",
            municipi: "Puigcerdà",
            adreca: "Carrer Major, 28, 17520 Puigcerdà",
            telefon: "972 880 456",
            email: "contacte@formatgeriapirineu.cat",
            web: "www.formatgeriapirineu.cat",
            producte1_nom: "Formatge de tupí",
            producte1_categoria: "Formatges i làctics",
            
            producte1_descripcio: "Formatge fermentat típic de la Cerdanya, elaborat amb llet crua d'ovella.",
            producte2_nom: "Mató de muntanya",
            producte2_categoria: "Formatges i làctics",
           
            producte2_descripcio: "Mató fresc elaborat diàriament amb llet de vaca del Pirineu.",
            lat: 42.4318,
            lng: 1.9286
        },
        {
            nom: "Celler Vall del Montsant",
            comarca: "Priorat",
            municipi: "Falset",
            adreca: "Avinguda Catalunya, 45, 43730 Falset",
            telefon: "977 830 234",
            email: "celler@vallmontsant.cat",
            web: "www.vallmontsant.cat",
            producte1_nom: "Vi negre DO Montsant",
            producte1_categoria: "Begudes artesanes (vi, cava, licors, cerveses)",
            
            producte1_descripcio: "Vi negre de garnatxa i carinyena amb 12 mesos de criança en bóta de roure.",
            producte2_nom: "Oli d'oliva verge extra",
            producte2_categoria: "Oli i olives",
            producte2_descripcio: "Oli d'arbequina de primera premsada en fred.",
            lat: 41.1461,
            lng: 0.8256
        }
    ];
}
