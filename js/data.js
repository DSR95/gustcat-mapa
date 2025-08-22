// Carregar dades de Google Sheets
async function loadShopsFromGoogleSheets() {
    try {
        console.log('Loading shops from Google Sheets...');
        showLoadingSpinner();
        
        const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(CONFIG.SHEET_NAME)}`;
        console.log('Fetching URL:', url);
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        console.log('Response text length:', text.length);
        
        if (!text.includes('google.visualization.Query.setResponse')) {
            throw new Error('Invalid Google Sheets response format');
        }
        
        const jsonString = text.substring(47).slice(0, -2);
        const data = JSON.parse(jsonString);
        
        console.log('Parsed Google Sheets data successfully');
        
        allShops = await processGoogleSheetsData(data);
        
        if (allShops.length === 0) {
            throw new Error('No valid shops found in spreadsheet');
        }
        
        filteredShops = [...allShops];
        
        updateFilters();
        displayShops(filteredShops);
        addMarkersToMap(filteredShops);
        updateResultsCount();
        
        hideLoadingSpinner();
        showSuccessMessage(`S'han carregat ${allShops.length} comerços del Google Sheet`);
        
    } catch (error) {
        console.error('Error loading Google Sheets data:', error);
        console.log('Fallback: Using sample data...');
        
        allShops = getSampleData();
        filteredShops = [...allShops];
        
        updateFilters();
        displayShops(filteredShops);
        addMarkersToMap(filteredShops);
        updateResultsCount();
        
        hideLoadingSpinner();
        showErrorMessage('Error carregant Google Sheet. Mostrant dades de mostra.');
    }
}

// Processar dades de Google Sheets
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
    
    for (let i = 1; i < rows.length; i++) {
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
        
        const nom = getCellValue(0);
        const logo_comerc = getCellValue(1);
        const descripcio_comerc = getCellValue(2);
        const producte1_nom = getCellValue(3);
        const producte1_categoria = getCellValue(4);
        const producte1_foto_raw = getCellValue(5);
        const producte1_descripcio = getCellValue(6);
        const producte2_nom = getCellValue(7);
        const producte2_categoria = getCellValue(8);
        const producte2_foto_raw = getCellValue(9);
        const producte2_descripcio = getCellValue(10);
        const adreca = getCellValue(11);
        const codi_postal = getCellValue(12);
        const municipi = getCellValue(13);
        const comarca = getCellValue(14);
        const telefon = getCellValue(15);
        const email = getCellValue(16);
        const web = getCellValue(17);
        const actiu = getCellValue(18);
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
            
            const fullAddress = `${adreca} ${codi_postal} ${municipi}, Catalunya`.trim();
            const coords = await geocodeAddress(fullAddress || `${municipi}, Catalunya`);
            if (coords) {
                shop.lat = coords.lat;
                shop.lng = coords.lng;
            }
            
            shops.push(shop);
            console.log(`✅ Added shop: ${shop.nom} (Status: ${actiu})`);
        } else {
            console.log(`⚠ Skipped row ${i} - Name: "${nom}", Active: "${actiu}"`);
        }
    }
    
    console.log(`Total active shops processed: ${shops.length}`);
    return shops;
}

// Dades de mostra
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
            producte1_preu: "18€/kg",
            producte1_descripcio: "Llonganissa artesana amb Indicació Geogràfica Protegida, elaborada segons la recepta tradicional.",
            producte2_nom: "Botifarra de perol",
            producte2_categoria: "Embotits propis",
            producte2_preu: "14€/kg",
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
            producte1_preu: "22€/kg",
            producte1_descripcio: "Formatge fermentat típic de la Cerdanya, elaborat amb llet crua d'ovella.",
            producte2_nom: "Mató de muntanya",
            producte2_categoria: "Formatges i làctics",
            producte2_preu: "8€/unitat",
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
            producte1_preu: "15€/ampolla",
            producte1_descripcio: "Vi negre de garnatxa i carinyena amb 12 mesos de criança en bóta de roure.",
            producte2_nom: "Oli d'oliva verge extra",
            producte2_categoria: "Oli i olives",
            producte2_preu: "18€/litre",
            producte2_descripcio: "Oli d'arbequina de primera premsada en fred.",
            lat: 41.1461,
            lng: 0.8256
        }
    ];
}
