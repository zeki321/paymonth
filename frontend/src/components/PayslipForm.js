import React, { useEffect, useState } from 'react';
import { fetchEmployees, createPayslip } from '../api';

function PayslipForm({ onCreated }) {
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState('');
  const [period, setPeriod] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchEmployees().then(setEmployees).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const payslip = await createPayslip(parseInt(employeeId), period);
      setMessage({ type: 'success', text: `Fiche créée — Net : ${payslip.net_salary} €` });
      setEmployeeId('');
      setPeriod('');
      if (onCreated) onCreated();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2>Nouvelle fiche de paie</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="employee">Employé :</label>
          <select
            id="employee"
            value={employeeId}
            onChange={e => setEmployeeId(e.target.value)}
            required
          >
            <option value="">-- Sélectionner --</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.first_name} {emp.last_name} — {emp.department}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="period">Période :</label>
          <input
            id="period"
            type="month"
            value={period}
            onChange={e => setPeriod(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Création...' : 'Créer la fiche'}
        </button>
      </form>

      {message && (
        <p className={message.type === 'error' ? 'error' : 'success'}>
          {message.text}
        </p>
      )}
    </div>
  );
}

export default PayslipForm;
