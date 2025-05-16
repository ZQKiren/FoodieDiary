// __tests__/controllers/getSharedPost.test.js
const { PrismaClient } = require('@prisma/client');
const postController = require('../../controllers/postController');

// More comprehensive mock of PrismaClient
jest.mock('@prisma/client', () => {
  // Create mock functions for all methods that might be used
  const mockFindUnique = jest.fn();
  const mockCreate = jest.fn();
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();
  const mockFindMany = jest.fn();
  const mockCount = jest.fn();
  
  const mockPrisma = {
    post: {
      findUnique: mockFindUnique,
      create: mockCreate,
      update: mockUpdate,
      delete: mockDelete,
      findMany: mockFindMany,
      count: mockCount
    }
  };
  
  return { 
    PrismaClient: jest.fn(() => mockPrisma)
  };
});

// Mock console.error to prevent error logs during tests
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('GetSharedPost Controller', () => {
  let req;
  let res;
  const prisma = new PrismaClient();
  
  beforeEach(() => {
    req = {
      params: { id: '5' }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Clear all mocks to ensure tests are isolated
    jest.clearAllMocks();
  });
  
  test('returns shared post if it exists and is approved', async () => {
    const mockPost = {
      id: 5,
      title: 'Test Post',
      isApproved: true,
      user: {
        id: 1,
        name: 'Test User'
      }
    };
    
    prisma.post.findUnique.mockResolvedValue(mockPost);
    
    await postController.getSharedPost(req, res);
    
    expect(prisma.post.findUnique).toHaveBeenCalledWith({
      where: { id: 5 },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockPost);
  });
  
  test('returns 404 if post does not exist', async () => {
    prisma.post.findUnique.mockResolvedValue(null);
    
    await postController.getSharedPost(req, res);
    
    expect(prisma.post.findUnique).toHaveBeenCalledWith({
      where: { id: 5 },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Post not found'
    });
  });
  
  test('returns 403 if post is not approved', async () => {
    const mockPost = {
      id: 5,
      title: 'Test Post',
      isApproved: false,
      user: {
        id: 1,
        name: 'Test User'
      }
    };
    
    prisma.post.findUnique.mockResolvedValue(mockPost);
    
    await postController.getSharedPost(req, res);
    
    expect(prisma.post.findUnique).toHaveBeenCalledWith({
      where: { id: 5 },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'This post is not available'
    });
  });
  
  test('handles server error', async () => {
    const error = new Error('Database error');
    prisma.post.findUnique.mockRejectedValue(error);
    
    await postController.getSharedPost(req, res);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error getting post',
      error: 'Database error'
    });
  });
});