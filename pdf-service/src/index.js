const express = require('express');
const { generatePayslipPDF } = require('./generator');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'paymonth-pdf-service' });
});

// POST /api/generate — Générer un PDF de bulletin de paie
app.post('/api/generate', async (req, res) => {
  try {
    const requiredFields = ['first_name', 'last_name', 'period', 'gross_salary', 'social_contributions', 'income_tax', 'net_salary'];
    const missing = requiredFields.filter(f => !req.body[f]);

    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missing.join(', ')}`
      });
    }

    console.log(`Generating PDF for ${req.body.first_name} ${req.body.last_name} — ${req.body.period}`);

    const filepath = await generatePayslipPDF(req.body);
    const filename = path.basename(filepath);

    console.log(`PDF generated: ${filename}`);

    res.json({
      message: 'PDF generated successfully',
      pdf_url: `/pdfs/${filename}`,
      filename,
    });
  } catch (err) {
    console.error('Error generating PDF:', err.message);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Servir les PDF générés
app.use('/pdfs', express.static(path.join(__dirname, '..', 'output')));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`PDF service running on http://localhost:${PORT}`);
});

module.exports = app;
