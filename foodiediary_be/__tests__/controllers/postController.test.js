const { PrismaClient } = require('@prisma/client');
const postController = require('../../controllers/postController');

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

// Improved stream mock
class MockReadable {
  constructor() {
    this.data = [];
  }

  push(chunk) {
    if (chunk !== null) {
      this.data.push(chunk);
    }
    return true;
  }

  pipe(dest) {
    // Process all data and trigger callback
    if (dest.processData) {
      for (const chunk of this.data) {
        dest.processData(chunk);
      }
    }
    return dest;
  }
}

jest.mock('stream', () => ({
  Readable: MockReadable
}));

// Better Cloudinary mock
jest.mock('../../config/cloudinary', () => {
  return {
    uploader: {
      upload: jest.fn().mockResolvedValue({ secure_url: 'https://cloudinary.com/image.jpg' }),
      upload_stream: (options, callback) => {
        // Return an object with processData method that will be called by the pipe method
        return {
          processData: (data) => {
            callback(null, { secure_url: 'https://cloudinary.com/image.jpg' });
          }
        };
      }
    }
  };
});

jest.mock('fs', () => ({
  unlinkSync: jest.fn()
}));

describe('Post Controller', () => {
  let req;
  let res;
  let consoleErrorSpy;
  const prisma = new PrismaClient();
  
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
    
    // Spy on console.error and suppress output
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    // Restore console.error after each test
    consoleErrorSpy.mockRestore();
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
      const mockPost = { 
        id: 1, 
        ...req.body, 
        rating: 4,
        eatenAt: new Date('2023-01-01'),
        userId: 1, 
        isApproved: false,
        image: '' 
      };
      
      prisma.post.create.mockResolvedValue(mockPost);
      
      await postController.createPost(req, res);
      
      expect(prisma.post.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Test Post',
          location: 'Test Location',
          review: 'Test Review',
          rating: 4,
          image: '',
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
    
    test('creates a post with image', async () => {
      req.file = {
        buffer: Buffer.from('test image data')
      };
      
      const mockPost = { 
        id: 1, 
        ...req.body, 
        rating: 4,
        eatenAt: new Date('2023-01-01'),
        userId: 1, 
        isApproved: false,
        image: 'https://cloudinary.com/image.jpg' 
      };
      
      prisma.post.create.mockResolvedValue(mockPost);
      
      await postController.createPost(req, res);
      
      expect(prisma.post.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Test Post',
          location: 'Test Location',
          review: 'Test Review',
          rating: 4,
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
    
    test('handles database errors', async () => {
      const error = new Error('Database error');
      prisma.post.create.mockRejectedValue(error);
      
      await postController.createPost(req, res);
      
      // Verify console.error was called with the right arguments
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating post:', error);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error creating post',
        error: 'Database error'
      });
    });
    
    test('handles cloudinary upload errors', async () => {
      req.file = {
        buffer: Buffer.from('test image data')
      };
      
      // Temporarily override the cloudinary mock to simulate an error
      const cloudinary = require('../../config/cloudinary');
      const originalUploadStream = cloudinary.uploader.upload_stream;
      
      cloudinary.uploader.upload_stream = (options, callback) => {
        return {
          processData: () => {
            callback(new Error('Upload failed'), null);
          }
        };
      };
      
      await postController.createPost(req, res);
      
      // Verify console.error was called
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error creating post',
        error: expect.any(String)
      });
      
      // Restore the original mock
      cloudinary.uploader.upload_stream = originalUploadStream;
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
    
    test('handles errors', async () => {
      const error = new Error('Database error');
      prisma.post.findMany.mockRejectedValue(error);
      
      await postController.getUserPosts(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error getting posts',
        error: 'Database error'
      });
    });
  });
  
  // Add more tests for other controller methods as needed
});