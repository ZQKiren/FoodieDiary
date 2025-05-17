const request = require('supertest');
const express = require('express');
const bookmarkRoutes = require('../../routes/bookmarkRoutes');
const { protect } = require('../../middleware/auth');
const bookmarkController = require('../../controllers/bookmarkController');

jest.mock('../../middleware/auth', () => ({
  protect: jest.fn((req, res, next) => {
    req.user = { id: 1 };
    next();
  })
}));

jest.mock('../../controllers/bookmarkController', () => ({
  toggleBookmark: jest.fn((req, res) => res.json({ message: 'Bookmark toggled' })),
  getUserBookmarks: jest.fn((req, res) => res.json({ posts: [] })),
  checkBookmark: jest.fn((req, res) => res.json({ isBookmarked: true }))
}));

const app = express();
app.use(express.json());
app.use('/api/bookmarks', bookmarkRoutes);

describe('Bookmark Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  test('POST /toggle - toggles a bookmark', async () => {
    const response = await request(app)
      .post('/api/bookmarks/toggle')
      .send({
        postId: 5
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Bookmark toggled' });
    expect(protect).toHaveBeenCalled();
    expect(bookmarkController.toggleBookmark).toHaveBeenCalled();
  });
  
  test('GET / - gets user bookmarks', async () => {
    const response = await request(app)
      .get('/api/bookmarks')
      .query({ page: 1, limit: 10 });
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ posts: [] });
    expect(protect).toHaveBeenCalled();
    expect(bookmarkController.getUserBookmarks).toHaveBeenCalled();
  });
  
  test('GET /:postId - checks bookmark status', async () => {
    const response = await request(app)
      .get('/api/bookmarks/5');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ isBookmarked: true });
    expect(protect).toHaveBeenCalled();
    expect(bookmarkController.checkBookmark).toHaveBeenCalled();
  });
});