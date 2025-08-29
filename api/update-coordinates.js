import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { shopIndex, lat, lng } = req.body;
    
    // Configurar Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    
    // Calcular la fila (shopIndex + 1 perquè les files comencen per 1)
    const rowNumber = shopIndex + 1;
    
    // Actualitzar columnes U (lat) i V (lng)
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data: [
          {
            range: `${process.env.GOOGLE_SHEET_NAME}!U${rowNumber}`,
            values: [[lat]]
          },
          {
            range: `${process.env.GOOGLE_SHEET_NAME}!V${rowNumber}`,
            values: [[lng]]
          }
        ]
      }
    });

    console.log(`Coordenades guardades al Sheets: fila ${rowNumber}, lat=${lat}, lng=${lng}`);
    
    res.status(200).json({ 
      success: true,
      message: 'Coordenades guardades al Google Sheets'
    });
    
  } catch (error) {
    console.error('Error updating coordinates:', error);
    res.status(500).json({ 
      error: 'Failed to update coordinates',
      message: error.message 
    });
  }
}
