const express = require('express');
const router = express.Router();
const pool = require('../db');

const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL || 'http://localhost:3002';

// GET /api/payslips — Liste toutes les fiches de paie
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, e.first_name, e.last_name, e.position, e.department
      FROM payslips p
      JOIN employees e ON p.employee_id = e.id
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching payslips:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/payslips/:id — Détail d'une fiche de paie
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT p.*, e.first_name, e.last_name, e.email, e.position,
             e.department, e.social_security_number, e.hire_date
      FROM payslips p
      JOIN employees e ON p.employee_id = e.id
      WHERE p.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payslip not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching payslip:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/payslips — Créer une fiche de paie
router.post('/', async (req, res) => {
  try {
    const { employee_id, period } = req.body;

    if (!employee_id || !period) {
      return res.status(400).json({ error: 'employee_id and period are required' });
    }

    // Récupérer le salaire brut de l'employé
    const empResult = await pool.query('SELECT * FROM employees WHERE id = $1', [employee_id]);
    if (empResult.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const employee = empResult.rows[0];
    const gross = parseFloat(employee.gross_salary);

    // Calcul simplifié des charges
    const social_contributions = Math.round(gross * 0.22 * 100) / 100;
    const income_tax = Math.round(gross * 0.10 * 100) / 100;
    const net_salary = Math.round((gross - social_contributions - income_tax) * 100) / 100;

    const result = await pool.query(
      `INSERT INTO payslips (employee_id, period, gross_salary, social_contributions, income_tax, net_salary, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'draft')
       RETURNING *`,
      [employee_id, period, gross, social_contributions, income_tax, net_salary]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating payslip:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/payslips/:id/generate-pdf — Demander la génération du PDF
router.post('/:id/generate-pdf', async (req, res) => {
  try {
    const { id } = req.params;

    // Récupérer la fiche complète
    const result = await pool.query(`
      SELECT p.*, e.first_name, e.last_name, e.email, e.position,
             e.department, e.social_security_number, e.hire_date
      FROM payslips p
      JOIN employees e ON p.employee_id = e.id
      WHERE p.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payslip not found' });
    }

    const payslipData = result.rows[0];

    // Appeler le service PDF
    const pdfResponse = await fetch(`${PDF_SERVICE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payslipData),
    });

    if (!pdfResponse.ok) {
      throw new Error(`PDF service responded with ${pdfResponse.status}`);
    }

    const pdfResult = await pdfResponse.json();

    // Mettre à jour le statut et l'URL du PDF
    await pool.query(
      `UPDATE payslips SET status = 'generated', pdf_url = $1 WHERE id = $2`,
      [pdfResult.pdf_url, id]
    );

    res.json({ message: 'PDF generated successfully', pdf_url: pdfResult.pdf_url });
  } catch (err) {
    console.error('Error generating PDF:', err.message);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

module.exports = router;
