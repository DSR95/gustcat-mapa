import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const formData = req.body;
    
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
Data: ${new Date().toLocaleString('ca-ES')}
IP: ${req.headers['x-forwarded-for'] || 'No detectada'}
    `;

const result = await resend.emails.send({
  from: 'GustCat <onboarding@resend.dev>',
  to: [process.env.CONTACT_EMAIL],
  subject: `Nova sol·licitud de registre: ${formData.nom}`,
  text: emailContent,
});

    console.log('Email enviat:', result);
    
    res.status(200).json({
      success: true,
      message: 'Sol·licitud enviada correctament'
    });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      error: 'Error enviant la sol·licitud',
      message: error.message
    });
  }
}
