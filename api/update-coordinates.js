export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { shopIndex, lat, lng } = req.body;
    
    // Aquí hauries d'implementar l'actualització al Google Sheets
    // Utilitzant la Google Sheets API per escriure a les columnes U i V
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating coordinates:', error);
    res.status(500).json({ error: 'Failed to update coordinates' });
  }
}
