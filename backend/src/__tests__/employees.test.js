const request = require('supertest');

// Mock de la base de données
jest.mock('../db', () => ({
  query: jest.fn(),
  on: jest.fn(),
}));

const pool = require('../db');
const app = require('../index');

describe('GET /api/employees', () => {
  afterEach(() => jest.clearAllMocks());

  it('should return a list of employees', async () => {
    const mockEmployees = [
      { id: 1, first_name: 'Marie', last_name: 'Dupont', email: 'marie@test.com', position: 'Dev', department: 'Eng', gross_salary: 3500, hire_date: '2023-03-15' },
    ];

    pool.query.mockResolvedValue({ rows: mockEmployees });

    const res = await request(app).get('/api/employees');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].first_name).toBe('Marie');
  });

  it('should return 500 on database error', async () => {
    pool.query.mockRejectedValue(new Error('DB connection failed'));

    const res = await request(app).get('/api/employees');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal server error');
  });
});

describe('GET /api/employees/:id', () => {
  it('should return 404 for non-existent employee', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const res = await request(app).get('/api/employees/999');

    expect(res.status).toBe(404);
  });
});

describe('POST /api/employees', () => {
  it('should return 400 if required fields are missing', async () => {
    const res = await request(app)
      .post('/api/employees')
      .send({ first_name: 'Test' });

    expect(res.status).toBe(400);
  });
});

describe('GET /health', () => {
  it('should return ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
