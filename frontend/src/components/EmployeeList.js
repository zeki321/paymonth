import React, { useEffect, useState } from 'react';
import { fetchEmployees } from '../api';

function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEmployees()
      .then(setEmployees)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Chargement des employés...</p>;
  if (error) return <p className="error">Erreur : {error}</p>;

  return (
    <div className="card">
      <h2>Employés ({employees.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Poste</th>
            <th>Département</th>
            <th>Salaire brut</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp.id}>
              <td>{emp.first_name} {emp.last_name}</td>
              <td>{emp.position}</td>
              <td>{emp.department}</td>
              <td>{parseFloat(emp.gross_salary).toFixed(2)} €</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeList;
