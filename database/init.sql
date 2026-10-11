-- Schéma de base de données pour PayMonth
-- Ce script est exécuté au démarrage de PostgreSQL

CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    position VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    gross_salary DECIMAL(10, 2) NOT NULL,
    hire_date DATE NOT NULL,
    social_security_number VARCHAR(15) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payslips (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    period VARCHAR(7) NOT NULL,          -- Format: YYYY-MM
    gross_salary DECIMAL(10, 2) NOT NULL,
    social_contributions DECIMAL(10, 2) NOT NULL,
    income_tax DECIMAL(10, 2) NOT NULL,
    net_salary DECIMAL(10, 2) NOT NULL,
    pdf_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'draft',  -- draft, generated, sent
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Données de test
INSERT INTO employees (first_name, last_name, email, position, department, gross_salary, hire_date, social_security_number)
VALUES
    ('Marie', 'Dupont', 'marie.dupont@bunivers.com', 'Développeuse Full Stack', 'Engineering', 3500.00, '2023-03-15', '2-95-06-75-108'),
    ('Jean', 'Martin', 'jean.martin@bunivers.com', 'Chef de Projet', 'Management', 4200.00, '2022-01-10', '1-88-11-33-205'),
    ('Sophie', 'Bernard', 'sophie.bernard@bunivers.com', 'Designer UX', 'Design', 3200.00, '2023-09-01', '2-92-04-44-312'),
    ('Pierre', 'Leroy', 'pierre.leroy@bunivers.com', 'DevOps Engineer', 'Infrastructure', 3800.00, '2021-06-20', '1-90-08-69-150'),
    ('Amina', 'Diallo', 'amina.diallo@bunivers.com', 'Data Analyst', 'Data', 3400.00, '2024-01-08', '2-97-12-93-421');

INSERT INTO payslips (employee_id, period, gross_salary, social_contributions, income_tax, net_salary, status)
VALUES
    (1, '2026-04', 3500.00, 770.00, 350.00, 2380.00, 'generated'),
    (2, '2026-04', 4200.00, 924.00, 504.00, 2772.00, 'generated'),
    (3, '2026-04', 3200.00, 704.00, 288.00, 2208.00, 'draft');
