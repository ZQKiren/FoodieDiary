const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { protect, admin } = require('../../middleware/auth');


jest.mock('jsonwebtoken');
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn()
    }
  };
  
  return { 
    PrismaClient: jest.fn(() => mockPrisma)
  };
});

describe('Auth Middleware', () => {
  let req;
  let res;
  let next;
  const prisma = new PrismaClient();
  
  beforeEach(() => {
    req = {
      headers: {
        authorization: 'Bearer valid-token'
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
    
    jwt.verify.mockImplementation((token, secret) => {
      if (token === 'valid-token') {
        return { id: 1 };
      }
      throw new Error('Invalid token');
    });
    
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'user'
    });
    
    process.env.JWT_SECRET = 'test-secret';
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('protect middleware', () => {
    test('calls next() if token is valid', async () => {
      await protect(req, res, next);
      
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(req.user).toEqual({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      });
      expect(next).toHaveBeenCalled();
    });
    
    test('returns 401 if no token is provided', async () => {
      req.headers = {};
      
      await protect(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Not authorized, no token'
      });
      expect(next).not.toHaveBeenCalled();
    });
    
    test('returns 401 if token is invalid', async () => {
      req.headers.authorization = 'Bearer invalid-token';
      
      await protect(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Not authorized, token failed'
      });
      expect(next).not.toHaveBeenCalled();
    });
    
    test('returns 401 if user is not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      
      await protect(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User not found'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
  
  describe('admin middleware', () => {
    test('calls next() if user is admin', async () => {
      req.user = {
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin'
      };
      
      await admin(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });
    
    test('returns 403 if user is not admin', async () => {
      req.user = {
        id: 1,
        name: 'Regular User',
        email: 'user@example.com',
        role: 'user'
      };
      
      await admin(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Not authorized as admin'
      });
      expect(next).not.toHaveBeenCalled();
    });
    
    test('returns 403 if no user in request', async () => {
      req.user = null;
      
      await admin(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Not authorized as admin'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});