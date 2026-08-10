jest.mock('../models/Event', () => ({
  find: jest.fn()
}));

jest.mock('../models/TrialRequest', () => ({
  create: jest.fn(),
  find: jest.fn()
}));

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const { app } = require('../server');
const Event = require('../models/Event');
const TrialRequest = require('../models/TrialRequest');

describe('API routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.ADMIN_USERNAME = 'admin';
    process.env.ADMIN_PASSWORD_HASH = await bcrypt.hash('secret123', 10);
  });

  test('GET /api/events returns events from the database', async () => {
    const mockSort = jest.fn().mockResolvedValue([{ title: 'Junior Camp' }]);
    Event.find.mockReturnValue({ sort: mockSort });

    const response = await request(app).get('/api/events');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ title: 'Junior Camp' }]);
    expect(Event.find).toHaveBeenCalledTimes(1);
    expect(mockSort).toHaveBeenCalledWith({ date: 1 });
  });

  test('POST /api/trial-requests creates a trial request', async () => {
    TrialRequest.create.mockResolvedValue({ name: 'Asha' });

    const response = await request(app)
      .post('/api/trial-requests')
      .send({ name: 'Asha', email: 'asha@example.com' });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ message: "Thanks — we'll be in touch." });
    expect(TrialRequest.create).toHaveBeenCalledWith({
      name: 'Asha',
      email: 'asha@example.com'
    });
  });

  test('POST /api/auth/login returns a token for valid admin credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'secret123' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');

    const decoded = jwt.verify(response.body.token, 'test-secret');
    expect(decoded.username).toBe('admin');
  });

  test('GET /api/trial-requests rejects requests without a valid admin token', async () => {
    const response = await request(app).get('/api/trial-requests');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'No token provided' });
  });

  test('GET /api/trial-requests allows access with a valid admin token', async () => {
    const mockSort = jest.fn().mockResolvedValue([{ name: 'Asha' }]);
    TrialRequest.find.mockReturnValue({ sort: mockSort });

    const token = jwt.sign({ username: 'admin' }, 'test-secret', { expiresIn: '12h' });

    const response = await request(app)
      .get('/api/trial-requests')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ name: 'Asha' }]);
    expect(TrialRequest.find).toHaveBeenCalledTimes(1);
    expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
  });
});
