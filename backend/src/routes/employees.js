const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/employees — Liste tous les employés
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, first_name, last_name, email, position, department, gross_salary, hire_date FROM employees ORDER BY last_name'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching employees:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/employees/:id — Détail d'un employé
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM employees WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching employee:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/employees — Créer un employé
router.post('/', async (req, res) => {
  try {
    const { first_name, last_name, email, position, department, gross_salary, hire_date, social_security_number } = req.body;

    if (!first_name || !last_name || !email || !position || !department || !gross_salary || !hire_date || !social_security_number) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const result = await pool.query(
      `INSERT INTO employees (first_name, last_name, email, position, department, gross_salary, hire_date, social_security_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [first_name, last_name, email, position, department, gross_salary, hire_date, social_security_number]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Employee with this email or SSN already exists' });
    }
    console.error('Error creating employee:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
