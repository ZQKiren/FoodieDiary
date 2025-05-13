const { PrismaClient } = require('@prisma/client');
const postController = require('../../controllers/postController');

// Mock dependencies
jest.mock('@prisma/client', () => {
  const mockFindUnique = jest.fn();
  
  const mockPrisma = {
    post: {
      findUnique: mockFindUnique
    }
  };
  
  return { 
    PrismaClient: jest.fn(() => mockPrisma)
  };
});

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