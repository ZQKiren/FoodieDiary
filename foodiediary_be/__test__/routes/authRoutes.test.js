// test/routes/authRoutes.test.js
const request = require('supertest');
const express = require('express');
const authRoutes = require('../../routes/authRoutes');
const authController = require('../../controllers/authController');

// Mock the auth controller
jest.mock('../../controllers/authController', () => ({
  register: jest.fn((req, res) => res.json({ message: 'User registered' })),
  login: jest.fn((req, res) => res.json({ message: 'User logged in' }))
}));

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  test('POST /register - registers a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'User registered' });
    expect(authController.register).toHaveBeenCalled();
  });
  
  test('POST /login - logs in a user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'User logged in' });
    expect(authController.login).toHaveBeenCalled();
  });
});