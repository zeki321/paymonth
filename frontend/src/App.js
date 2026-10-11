import React, { useState } from 'react';
import EmployeeList from './components/EmployeeList';
import PayslipForm from './components/PayslipForm';
import PayslipList from './components/PayslipList';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState('payslips');

  const handlePayslipCreated = () => {
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="app">
      <header>
        <h1>PayMonth</h1>
        <p>Gestion des bulletins de paie — BUNIVERS</p>
      </header>

      <nav>
        <button
          className={activeTab === 'payslips' ? 'active' : ''}
          onClick={() => setActiveTab('payslips')}
        >
          Fiches de paie
        </button>
        <button
          className={activeTab === 'employees' ? 'active' : ''}
          onClick={() => setActiveTab('employees')}
        >
          Employés
        </button>
      </nav>

      <main>
        {activeTab === 'payslips' && (
          <>
            <PayslipForm onCreated={handlePayslipCreated} />
            <PayslipList refreshKey={refreshKey} />
          </>
        )}
        {activeTab === 'employees' && <EmployeeList />}
      </main>
    </div>
  );
}

export default App;
