const { PrismaClient } = require('@prisma/client');
const adminController = require('../../controllers/adminController');

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    post: {
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn()
    },
    user: {
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    $queryRaw: jest.fn()
  };
  
  return { 
    PrismaClient: jest.fn(() => mockPrisma)
  };
});

describe('Admin Controller', () => {
  let req;
  let res;
  const prisma = new PrismaClient();
  
  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    jest.clearAllMocks();
  });
  
  describe('getAllPosts', () => {
    test('gets all posts with pagination and filters', async () => {
      req.query = {
        page: '2',
        limit: '5',
        search: 'test',
        minRating: '3',
        approved: 'true'
      };
      
      const mockPosts = [{ id: 1, title: 'Test Post' }];
      prisma.post.findMany.mockResolvedValue(mockPosts);
      prisma.post.count.mockResolvedValue(15);
      
      await adminController.getAllPosts(req, res);
      
      expect(prisma.post.findMany).toHaveBeenCalledWith({
        where: {
          rating: { gte: 3 },
          isApproved: true,
          OR: [
            { title: { contains: 'test', mode: 'insensitive' } },
            { location: { contains: 'test', mode: 'insensitive' } }
          ]
        },
        skip: 5,
        take: 5,
        orderBy: { eatenAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      
      expect(prisma.post.count).toHaveBeenCalledWith({
        where: {
          rating: { gte: 3 },
          isApproved: true,
          OR: [
            { title: { contains: 'test', mode: 'insensitive' } },
            { location: { contains: 'test', mode: 'insensitive' } }
          ]
        }
      });
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        posts: mockPosts,
        totalPages: 3,
        currentPage: 2,
        total: 15
      });
    });
    
    test('handles server error', async () => {
      const error = new Error('Database error');
      prisma.post.findMany.mockRejectedValue(error);
      
      await adminController.getAllPosts(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error getting posts',
        error: 'Database error'
      });
    });
  });
  
  describe('updatePostStatus', () => {
    test('approves a post', async () => {
      req.params = { id: '5' };
      req.body = { isApproved: true };
      
      const updatedPost = { id: 5, title: 'Test Post', isApproved: true };
      prisma.post.update.mockResolvedValue(updatedPost);
      
      await adminController.updatePostStatus(req, res);
      
      expect(prisma.post.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: { isApproved: true }
      });
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post approved successfully',
        post: updatedPost
      });
    });
    
    test('hides a post', async () => {
      req.params = { id: '5' };
      req.body = { isApproved: false };
      
      const updatedPost = { id: 5, title: 'Test Post', isApproved: false };
      prisma.post.update.mockResolvedValue(updatedPost);
      
      await adminController.updatePostStatus(req, res);
      
      expect(prisma.post.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: { isApproved: false }
      });
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post hidden successfully',
        post: updatedPost
      });
    });
    
    test('handles server error', async () => {
      req.params = { id: '5' };
      req.body = { isApproved: true };
      
      const error = new Error('Database error');
      prisma.post.update.mockRejectedValue(error);
      
      await adminController.updatePostStatus(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error updating post status',
        error: 'Database error'
      });
    });
  });
  
  describe('getMonthlyStats', () => {
    test('gets monthly post stats', async () => {
      const mockRawStats = [
        { month: BigInt(1), count: BigInt(5) },
        { month: BigInt(2), count: BigInt(10) }
      ];
      
      prisma.$queryRaw.mockResolvedValue(mockRawStats);
      
      await adminController.getMonthlyStats(req, res);
      
      expect(prisma.$queryRaw).toHaveBeenCalled();
      
      const expectedFormattedStats = [
        { month: 1, count: 5 },
        { month: 2, count: 10 }
      ];
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedFormattedStats);
    });
    
    test('handles server error', async () => {
      const error = new Error('Database error');
      prisma.$queryRaw.mockRejectedValue(error);
      
      await adminController.getMonthlyStats(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error getting monthly stats',
        error: 'Database error'
      });
    });
  });
  
  describe('getCityStats', () => {
    test('gets city stats', async () => {
      const mockRawStats = [
        { city: 'New York', count: BigInt(5) },
        { city: 'Los Angeles', count: BigInt(3) }
      ];
      
      prisma.$queryRaw.mockResolvedValue(mockRawStats);
      
      await adminController.getCityStats(req, res);
      
      expect(prisma.$queryRaw).toHaveBeenCalled();
      
      const expectedFormattedStats = [
        { city: 'New York', count: 5 },
        { city: 'Los Angeles', count: 3 }
      ];
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedFormattedStats);
    });
    
    test('handles server error', async () => {
      const error = new Error('Database error');
      prisma.$queryRaw.mockRejectedValue(error);
      
      await adminController.getCityStats(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error getting city stats',
        error: 'Database error'
      });
    });
  });
  
  describe('getMostActiveUsers', () => {
    test('gets most active users', async () => {
      const mockUsers = [
        {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          _count: { posts: 10 }
        },
        {
          id: 2,
          name: 'Another User',
          email: 'another@example.com',
          _count: { posts: 5 }
        }
      ];
      
      prisma.user.findMany.mockResolvedValue(mockUsers);
      
      await adminController.getMostActiveUsers(req, res);
      
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          email: true,
          _count: {
            select: {
              posts: true
            }
          }
        },
        orderBy: {
          posts: {
            _count: 'desc'
          }
        },
        take: 10
      });
      
      const expectedFormattedUsers = [
        {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          postCount: 10
        },
        {
          id: 2,
          name: 'Another User',
          email: 'another@example.com',
          postCount: 5
        }
      ];
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedFormattedUsers);
    });
    
    test('handles server error', async () => {
      const error = new Error('Database error');
      prisma.user.findMany.mockRejectedValue(error);
      
      await adminController.getMostActiveUsers(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error getting active users',
        error: 'Database error'
      });
    });
  });
  
  describe('getAllUsers', () => {
    test('gets all users', async () => {
      const mockUsers = [
        {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          _count: { posts: 10 }
        },
        {
          id: 2,
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
          _count: { posts: 5 }
        }
      ];
      
      prisma.user.findMany.mockResolvedValue(mockUsers);
      
      await adminController.getAllUsers(req, res);
      
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          _count: {
            select: {
              posts: true
            }
          }
        }
      });
      
      const expectedFormattedUsers = [
        {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          postCount: 10
        },
        {
          id: 2,
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
          postCount: 5
        }
      ];
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedFormattedUsers);
    });
    
    test('handles server error', async () => {
      const error = new Error('Database error');
      prisma.user.findMany.mockRejectedValue(error);
      
      await adminController.getAllUsers(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error getting users',
        error: 'Database error'
      });
    });
  });
  
  describe('updateUserRole', () => {
    test('updates user role to admin', async () => {
      req.params = { id: '2' };
      req.body = { role: 'admin' };
      
      const updatedUser = {
        id: 2,
        name: 'Test User',
        email: 'user@example.com',
        role: 'admin'
      };
      
      prisma.user.update.mockResolvedValue(updatedUser);
      
      await adminController.updateUserRole(req, res);
      
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { role: 'admin' }
      });
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User role updated successfully',
        user: updatedUser
      });
    });
    
    test('updates user role to regular user', async () => {
      req.params = { id: '2' };
      req.body = { role: 'user' };
      
      const updatedUser = {
        id: 2,
        name: 'Test User',
        email: 'user@example.com',
        role: 'user'
      };
      
      prisma.user.update.mockResolvedValue(updatedUser);
      
      await adminController.updateUserRole(req, res);
      
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { role: 'user' }
      });
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User role updated successfully',
        user: updatedUser
      });
    });
    
    test('returns 400 for invalid role', async () => {
      req.params = { id: '2' };
      req.body = { role: 'superadmin' };
      
      await adminController.updateUserRole(req, res);
      
      expect(prisma.user.update).not.toHaveBeenCalled();
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid role'
      });
    });
    
    test('handles server error', async () => {
      req.params = { id: '2' };
      req.body = { role: 'admin' };
      
      const error = new Error('Database error');
      prisma.user.update.mockRejectedValue(error);
      
      await adminController.updateUserRole(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error updating user role',
        error: 'Database error'
      });
    });
  });
  
  describe('deleteUser', () => {
    test('deletes a user and their posts', async () => {
      req.params = { id: '2' };
      
      prisma.post.deleteMany.mockResolvedValue({ count: 5 });
      prisma.user.delete.mockResolvedValue({ id: 2 });
      
      await adminController.deleteUser(req, res);
      
      expect(prisma.post.deleteMany).toHaveBeenCalledWith({
        where: { userId: 2 }
      });
      
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: 2 }
      });
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User deleted successfully'
      });
    });
    
    test('handles server error', async () => {
      req.params = { id: '2' };
      
      const error = new Error('Database error');
      prisma.post.deleteMany.mockRejectedValue(error);
      
      await adminController.deleteUser(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error deleting user',
        error: 'Database error'
      });
    });
  });
});