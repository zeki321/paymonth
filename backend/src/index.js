require('dotenv').config();
const express = require('express');
const cors = require('cors');
const employeesRouter = require('./routes/employees');
const payslipsRouter = require('./routes/payslips');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'paymonth-backend' });
});

// Routes
app.use('/api/employees', employeesRouter);
app.use('/api/payslips', payslipsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

module.exports = app;
