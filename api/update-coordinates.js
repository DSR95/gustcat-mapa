export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { shopIndex, lat, lng } = req.body;
    
    // Per ara només logem les coordenades
    // Més endavant implementarem l'escriptura al Google Sheets
    console.log(`Guardant coordenades per comerç ${shopIndex}: lat=${lat}, lng=${lng}`);
    
    // Simular èxit
    res.status(200).json({ 
      success: true,
      message: 'Coordenades rebudes (encara no s\'escriuen al Sheets)'
    });
    
  } catch (error) {
    console.error('Error updating coordinates:', error);
    res.status(500).json({ 
      error: 'Failed to update coordinates',
      message: error.message 
    });
  }
}
