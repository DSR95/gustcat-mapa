export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const formData = req.body;
    
    // Construir el contingut del correu
    const emailContent = `
NOVA SOL·LICITUD DE REGISTRE - GUSTCAT

=== INFORMACIÓ DEL COMERÇ ===
Nom del comerç: ${formData.nom}
Comarca: ${formData.comarca}
Municipi: ${formData.municipi}
Adreça: ${formData.adreca}
Telèfon: ${formData.telefon || 'No especificat'}
Email: ${formData.email || 'No especificat'}
Web: ${formData.web || 'No especificada'}

=== PRODUCTE ESTRELLA 1 ===
Nom: ${formData.producte1_nom}
Categoria: ${formData.producte1_categoria}
Descripció: ${formData.producte1_descripcio || 'No especificada'}

=== PRODUCTE ESTRELLA 2 ===
Nom: ${formData.producte2_nom || 'No especificat'}
Categoria: ${formData.producte2_categoria || 'No especificada'}
Descripció: ${formData.producte2_descripcio || 'No especificada'}

=== INFORMACIÓ TÈCNICA ===
Data de sol·licitud: ${new Date().toLocaleString('ca-ES')}
IP: ${req.headers['x-forwarded-for'] || req.connection.remoteAddress}
User Agent: ${req.headers['user-agent']}

---
Aquesta sol·licitud s'ha generat automàticament des de GustCat.
    `;

    // Aquí usariem un servei d'email com Resend, SendGrid, etc.
    // Per simplicitat, retornem èxit (després cal configurar el servei real)
    
    console.log('Nova sol·licitud rebuda:', formData);
    console.log('Email content:', emailContent);
    
    res.status(200).json({
      success: true,
      message: 'Sol·licitud enviada correctament'
    });

  } catch (error) {
    console.error('Error sending contact form:', error);
    res.status(500).json({
      error: 'Error enviant la sol·licitud',
      message: error.message
    });
  }
}
