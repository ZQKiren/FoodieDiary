const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const authController = require('../../controllers/authController');

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn()
    }
  };
  
  return { 
    PrismaClient: jest.fn(() => mockPrisma)
  };
});

describe('Auth Controller', () => {
  let req;
  let res;
  const prisma = new PrismaClient();
  
  beforeEach(() => {
    req = {
      body: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    process.env.JWT_SECRET = 'test-secret';
    
    jest.clearAllMocks();
  });
  
  describe('register', () => {
    beforeEach(() => {
      req.body = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };
      
      bcrypt.hash.mockResolvedValue('hashed_password');
      
      jwt.sign.mockReturnValue('test_token');
    });
    
    test('creates a new user and returns a token', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'user'
      };
      
      prisma.user.create.mockResolvedValue(mockUser);
      
      await authController.register(req, res);
      
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      });
      
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          password: 'hashed_password',
          name: 'Test User',
          role: 'user'
        }
      });
      
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 1, email: 'test@example.com', role: 'user' },
        'test-secret',
        { expiresIn: '1d' }
      );
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User registered successfully',
        token: 'test_token',
        user: {
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
          role: 'user'
        }
      });
    });
    
    test('returns 400 if user already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'test@example.com'
      });
      
      await authController.register(req, res);
      
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      });
      
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(prisma.user.create).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User already exists'
      });
    });
    
    test('handles server error', async () => {
      const error = new Error('Database error');
      prisma.user.findUnique.mockRejectedValue(error);
      
      await authController.register(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error registering user',
        error: 'Database error'
      });
    });
  });
  
  describe('login', () => {
    beforeEach(() => {
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      jwt.sign.mockReturnValue('test_token');
    });
    
    test('logs in user and returns a token', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        password: 'hashed_password'
      };
      
      prisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      
      await authController.login(req, res);
      
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      });
      
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
      
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 1, email: 'test@example.com', role: 'user' },
        'test-secret',
        { expiresIn: '1d' }
      );
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Login successful',
        token: 'test_token',
        user: {
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
          role: 'user'
        }
      });
    });
    
    test('returns 401 if user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      
      await authController.login(req, res);
      
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      });
      
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid credentials'
      });
    });
    
    test('returns 401 if password is invalid', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed_password'
      };
      
      prisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);
      
      await authController.login(req, res);
      
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      });
      
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
      expect(jwt.sign).not.toHaveBeenCalled();
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid credentials'
      });
    });
    
    test('handles server error', async () => {
      const error = new Error('Database error');
      prisma.user.findUnique.mockRejectedValue(error);
      
      await authController.login(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error logging in',
        error: 'Database error'
      });
    });
  });
});