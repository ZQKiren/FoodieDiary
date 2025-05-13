const { PrismaClient } = require('@prisma/client');
const postController = require('../../controllers/postController');

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    post: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    }
  };
  
  return { 
    PrismaClient: jest.fn(() => mockPrisma)
  };
});

// Mock stream module
jest.mock('stream', () => require('../__mocks__/stream'));

// Mock cloudinary
jest.mock('../../config/cloudinary', () => {
  const mockUploadStream = (options, callback) => {
    return {
      processData: (data) => {
        callback(null, { secure_url: 'https://cloudinary.com/image.jpg' });
      }
    };
  };
  
  return {
    uploader: {
      upload: jest.fn().mockResolvedValue({ secure_url: 'https://cloudinary.com/image.jpg' }),
      upload_stream: mockUploadStream
    }
  };
});

// Mock fs
jest.mock('fs', () => ({
  unlinkSync: jest.fn()
}));

describe('Post Controller', () => {
  let req;
  let res;
  const prisma = new PrismaClient();
  const cloudinary = require('../../config/cloudinary');
  
  beforeEach(() => {
    req = {
      body: {},
      user: { id: 1 },
      params: {},
      query: {},
      file: null
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    jest.clearAllMocks();
  });
  
  describe('createPost', () => {
    beforeEach(() => {
      req.body = {
        title: 'Test Post',
        location: 'Test Location',
        review: 'Test Review',
        rating: '4',
        eatenAt: '2023-01-01'
      };
    });
    
    test('creates a post without image', async () => {
      const mockPost = { id: 1, ...req.body, userId: 1, isApproved: false };
      prisma.post.create.mockResolvedValue(mockPost);
      
      await postController.createPost(req, res);
      
      expect(prisma.post.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Post',
          location: 'Test Location',
          review: 'Test Review',
          rating: 4,
          eatenAt: expect.any(Date),
          image: '',
          userId: 1,
          isApproved: false
        }
      });
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post created successfully',
        post: mockPost
      });
    });
    
    test('creates a post with image', async () => {
      req.file = {
        path: 'uploads/test.jpg',
        buffer: Buffer.from('test image data')
      };
      
      const mockPost = { 
        id: 1, 
        ...req.body, 
        userId: 1, 
        isApproved: false,
        image: 'https://cloudinary.com/image.jpg' 
      };
      
      prisma.post.create.mockResolvedValue(mockPost);
      
      await postController.createPost(req, res);
      
      // No longer need to check for cloudinary.uploader.upload call
      // since we're using upload_stream
      
      expect(prisma.post.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Test Post',
          location: 'Test Location',
          review: 'Test Review',
          rating: 4,
          eatenAt: expect.any(Date),
          image: 'https://cloudinary.com/image.jpg',
          userId: 1,
          isApproved: false
        })
      });
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post created successfully',
        post: mockPost
      });
    });
    
    test('handles errors', async () => {
      const error = new Error('Database error');
      prisma.post.create.mockRejectedValue(error);
      
      await postController.createPost(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error creating post',
        error: 'Database error'
      });
    });
  });
  
  describe('getUserPosts', () => {
    test('gets user posts with pagination and filters', async () => {
      req.query = {
        page: 2,
        limit: 5,
        search: 'test',
        minRating: 3
      };
      
      const mockPosts = [{ id: 1, title: 'Test Post' }];
      prisma.post.findMany.mockResolvedValue(mockPosts);
      prisma.post.count.mockResolvedValue(15);
      
      await postController.getUserPosts(req, res);
      
      expect(prisma.post.findMany).toHaveBeenCalledWith({
        where: {
          userId: 1,
          rating: { gte: 3 },
          OR: [
            { title: { contains: 'test', mode: 'insensitive' } },
            { location: { contains: 'test', mode: 'insensitive' } }
          ]
        },
        skip: 5,
        take: 5,
        orderBy: { eatenAt: 'desc' }
      });
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        posts: mockPosts,
        totalPages: 3,
        currentPage: 2,
        total: 15
      });
    });
  });
});