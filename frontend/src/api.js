const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export async function fetchEmployees() {
  const res = await fetch(`${API_URL}/api/employees`);
  if (!res.ok) throw new Error('Failed to fetch employees');
  return res.json();
}

export async function fetchPayslips() {
  const res = await fetch(`${API_URL}/api/payslips`);
  if (!res.ok) throw new Error('Failed to fetch payslips');
  return res.json();
}

export async function createPayslip(employeeId, period) {
  const res = await fetch(`${API_URL}/api/payslips`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employee_id: employeeId, period }),
  });
  if (!res.ok) throw new Error('Failed to create payslip');
  return res.json();
}

export async function generatePDF(payslipId) {
  const res = await fetch(`${API_URL}/api/payslips/${payslipId}/generate-pdf`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to generate PDF');
  return res.json();
}
