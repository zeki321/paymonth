import React, { useEffect, useState } from 'react';
import { fetchPayslips, generatePDF } from '../api';

function PayslipList({ refreshKey }) {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);

  const load = () => {
    setLoading(true);
    fetchPayslips()
      .then(setPayslips)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [refreshKey]);

  const handleGenerate = async (id) => {
    setGenerating(id);
    try {
      await generatePDF(id);
      load();
    } catch (err) {
      alert('Erreur lors de la génération : ' + err.message);
    } finally {
      setGenerating(null);
    }
  };

  if (loading) return <p>Chargement des fiches...</p>;

  return (
    <div className="card">
      <h2>Fiches de paie ({payslips.length})</h2>
      {payslips.length === 0 ? (
        <p>Aucune fiche de paie.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Employé</th>
              <th>Période</th>
              <th>Brut</th>
              <th>Net</th>
              <th>Statut</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {payslips.map(p => (
              <tr key={p.id}>
                <td>{p.first_name} {p.last_name}</td>
                <td>{p.period}</td>
                <td>{parseFloat(p.gross_salary).toFixed(2)} €</td>
                <td>{parseFloat(p.net_salary).toFixed(2)} €</td>
                <td>
                  <span className={`badge badge-${p.status}`}>
                    {p.status}
                  </span>
                </td>
                <td>
                  {p.status === 'draft' && (
                    <button
                      onClick={() => handleGenerate(p.id)}
                      disabled={generating === p.id}
                    >
                      {generating === p.id ? 'Génération...' : 'Générer PDF'}
                    </button>
                  )}
                  {p.pdf_url && (
                    <a href={p.pdf_url} target="_blank" rel="noopener noreferrer">
                      Télécharger
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PayslipList;
