const { PrismaClient } = require('@prisma/client');
const bookmarkController = require('../../controllers/bookmarkController');

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    post: {
      findUnique: jest.fn()
    },
    bookmark: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn()
    }
  };

  return {
    PrismaClient: jest.fn(() => mockPrisma)
  };
});

describe('Bookmark Controller', () => {
  let req;
  let res;
  let consoleSpy;
  const prisma = new PrismaClient();

  beforeEach(() => {
    req = {
      body: {},
      user: { id: 1 },
      params: {},
      query: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('toggleBookmark', () => {
    test('adds a bookmark when it does not exist', async () => {
      req.body = { postId: '5' };

      prisma.post.findUnique.mockResolvedValue({ id: 5, title: 'Test Post' });
      prisma.bookmark.findUnique.mockResolvedValue(null);

      const newBookmark = { id: 1, userId: 1, postId: 5 };
      prisma.bookmark.create.mockResolvedValue(newBookmark);

      await bookmarkController.toggleBookmark(req, res);

      expect(prisma.post.findUnique).toHaveBeenCalledWith({
        where: { id: 5 }
      });

      expect(prisma.bookmark.findUnique).toHaveBeenCalledWith({
        where: {
          userId_postId: {
            userId: 1,
            postId: 5
          }
        }
      });

      expect(prisma.bookmark.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          postId: 5
        }
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Bookmark added successfully',
        isBookmarked: true,
        bookmark: newBookmark
      });
    });

    test('removes a bookmark when it exists', async () => {
      req.body = { postId: '5' };

      prisma.post.findUnique.mockResolvedValue({ id: 5, title: 'Test Post' });

      const existingBookmark = { id: 1, userId: 1, postId: 5 };
      prisma.bookmark.findUnique.mockResolvedValue(existingBookmark);
      prisma.bookmark.delete.mockResolvedValue(existingBookmark);

      await bookmarkController.toggleBookmark(req, res);

      expect(prisma.post.findUnique).toHaveBeenCalledWith({
        where: { id: 5 }
      });

      expect(prisma.bookmark.findUnique).toHaveBeenCalledWith({
        where: {
          userId_postId: {
            userId: 1,
            postId: 5
          }
        }
      });

      expect(prisma.bookmark.delete).toHaveBeenCalledWith({
        where: {
          id: 1
        }
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Bookmark removed successfully',
        isBookmarked: false,
        bookmark: existingBookmark
      });
    });

    test('returns 400 if no postId is provided', async () => {
      req.body = {};

      await bookmarkController.toggleBookmark(req, res);

      expect(prisma.post.findUnique).not.toHaveBeenCalled();
      expect(prisma.bookmark.findUnique).not.toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post ID is required'
      });
    });

    test('returns 404 if post does not exist', async () => {
      req.body = { postId: '5' };

      prisma.post.findUnique.mockResolvedValue(null);

      await bookmarkController.toggleBookmark(req, res);

      expect(prisma.post.findUnique).toHaveBeenCalledWith({
        where: { id: 5 }
      });

      expect(prisma.bookmark.findUnique).not.toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post not found'
      });
    });

    test('handles server error', async () => {
      req.body = { postId: '5' };

      const error = new Error('Database error');
      prisma.post.findUnique.mockRejectedValue(error);

      await bookmarkController.toggleBookmark(req, res);

      expect(consoleSpy).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error toggling bookmark',
        error: 'Database error'
      });
    });
  });

  describe('getUserBookmarks', () => {
    test('gets user bookmarks with pagination', async () => {
      req.query = { page: '2', limit: '5' };

      const mockBookmarks = [
        {
          id: 1,
          userId: 1,
          postId: 5,
          createdAt: new Date('2023-01-01'),
          post: {
            id: 5,
            title: 'Test Post 1',
            user: {
              id: 2,
              name: 'Test User',
              email: 'test@example.com'
            }
          }
        },
        {
          id: 2,
          userId: 1,
          postId: 6,
          createdAt: new Date('2023-01-02'),
          post: {
            id: 6,
            title: 'Test Post 2',
            user: {
              id: 3,
              name: 'Another User',
              email: 'another@example.com'
            }
          }
        }
      ];

      prisma.bookmark.findMany.mockResolvedValue(mockBookmarks);
      prisma.bookmark.count.mockResolvedValue(15);

      await bookmarkController.getUserBookmarks(req, res);

      expect(prisma.bookmark.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        skip: 5,
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          post: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      });

      expect(prisma.bookmark.count).toHaveBeenCalledWith({
        where: { userId: 1 }
      });

      const expectedPosts = mockBookmarks.map(bookmark => ({
        ...bookmark.post,
        bookmarkedAt: bookmark.createdAt
      }));

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        posts: expectedPosts,
        totalPages: 3,
        currentPage: 2,
        total: 15
      });
    });

    test('handles server error', async () => {
      const error = new Error('Database error');
      prisma.bookmark.findMany.mockRejectedValue(error);

      await bookmarkController.getUserBookmarks(req, res);

      expect(consoleSpy).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error getting bookmarks',
        error: 'Database error'
      });
    });
  });

  describe('checkBookmark', () => {
    test('returns true if bookmark exists', async () => {
      req.params = { postId: '5' };

      prisma.bookmark.findUnique.mockResolvedValue({ id: 1, userId: 1, postId: 5 });

      await bookmarkController.checkBookmark(req, res);

      expect(prisma.bookmark.findUnique).toHaveBeenCalledWith({
        where: {
          userId_postId: {
            userId: 1,
            postId: 5
          }
        }
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        isBookmarked: true
      });
    });

    test('returns false if bookmark does not exist', async () => {
      req.params = { postId: '5' };

      prisma.bookmark.findUnique.mockResolvedValue(null);

      await bookmarkController.checkBookmark(req, res);

      expect(prisma.bookmark.findUnique).toHaveBeenCalledWith({
        where: {
          userId_postId: {
            userId: 1,
            postId: 5
          }
        }
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        isBookmarked: false
      });
    });

    test('handles server error', async () => {
      req.params = { postId: '5' };
      
      const error = new Error('Database error');
      prisma.bookmark.findUnique.mockRejectedValue(error);
      
      await bookmarkController.checkBookmark(req, res);
      
      expect(consoleSpy).toHaveBeenCalled();
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error checking bookmark status',
        error: 'Database error'
      });
    });
  });
});
  