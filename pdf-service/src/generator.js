const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = process.env.PDF_OUTPUT_DIR || path.join(__dirname, '..', 'output');

// Créer le dossier de sortie s'il n'existe pas
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Génère un bulletin de paie en PDF
 * @param {Object} data - Données de la fiche de paie
 * @returns {Promise<string>} - Chemin du fichier PDF généré
 */
function generatePayslipPDF(data) {
  return new Promise((resolve, reject) => {
    try {
      const filename = `bulletin_${data.last_name}_${data.period}.pdf`;
      const filepath = path.join(OUTPUT_DIR, filename);

      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filepath);

      doc.pipe(stream);

      // En-tête entreprise
      doc.fontSize(20).font('Helvetica-Bold').text('BUNIVERS', { align: 'center' });
      doc.fontSize(10).font('Helvetica').text('123 Rue de la Paie, 44000 Nantes', { align: 'center' });
      doc.text('SIRET: 123 456 789 00012', { align: 'center' });
      doc.moveDown(2);

      // Titre
      doc.fontSize(16).font('Helvetica-Bold').text('BULLETIN DE PAIE', { align: 'center' });
      doc.fontSize(12).text(`Période : ${data.period}`, { align: 'center' });
      doc.moveDown(2);

      // Informations employé
      doc.fontSize(11).font('Helvetica-Bold').text('INFORMATIONS EMPLOYÉ');
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      doc.font('Helvetica').fontSize(10);
      doc.text(`Nom : ${data.first_name} ${data.last_name}`);
      doc.text(`Poste : ${data.position}`);
      doc.text(`Département : ${data.department}`);
      doc.text(`N° Sécurité Sociale : ${data.social_security_number}`);
      doc.text(`Date d'embauche : ${new Date(data.hire_date).toLocaleDateString('fr-FR')}`);
      doc.moveDown(2);

      // Tableau des montants
      doc.fontSize(11).font('Helvetica-Bold').text('DÉTAIL DE LA RÉMUNÉRATION');
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      doc.font('Helvetica').fontSize(10);

      const drawRow = (label, amount, bold = false) => {
        const y = doc.y;
        if (bold) doc.font('Helvetica-Bold');
        doc.text(label, 50, y);
        doc.text(`${amount.toFixed(2)} €`, 400, y, { width: 150, align: 'right' });
        if (bold) doc.font('Helvetica');
        doc.moveDown(0.5);
      };

      drawRow('Salaire brut', data.gross_salary);
      drawRow('Cotisations sociales (22%)', -data.social_contributions);
      drawRow('Impôt sur le revenu (10%)', -data.income_tax);
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);
      drawRow('NET À PAYER', data.net_salary, true);

      // Pied de page
      doc.moveDown(4);
      doc.fontSize(8).font('Helvetica')
        .text(`Document généré le ${new Date().toLocaleDateString('fr-FR')} — Ce bulletin doit être conservé sans limitation de durée.`,
          { align: 'center' });

      doc.end();

      stream.on('finish', () => resolve(filepath));
      stream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generatePayslipPDF };
