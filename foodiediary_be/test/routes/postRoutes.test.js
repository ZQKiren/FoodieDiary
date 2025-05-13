// test/routes/postRoutes.test.js
const request = require('supertest');
const express = require('express');
const postRoutes = require('../../routes/postRoutes');
const { protect } = require('../../middleware/auth');
const postController = require('../../controllers/postController');

// Mock các dependencies
jest.mock('../../middleware/auth', () => ({
  protect: jest.fn((req, res, next) => {
    req.user = { id: 1 };
    next();
  })
}));

jest.mock('../../middleware/upload', () => ({
  single: jest.fn(() => (req, res, next) => next())
}));

jest.mock('../../controllers/postController', () => ({
  createPost: jest.fn((req, res) => res.json({ message: 'Post created' })),
  getUserPosts: jest.fn((req, res) => res.json({ posts: [] })),
  getPost: jest.fn((req, res) => res.json({ id: 1 })),
  updatePost: jest.fn((req, res) => res.json({ message: 'Post updated' })),
  deletePost: jest.fn((req, res) => res.json({ message: 'Post deleted' })),
  getSharedPost: jest.fn((req, res) => res.json({ id: 1, isShared: true }))
}));

// Tạo app Express cho testing
const app = express();
app.use(express.json());
app.use('/api/posts', postRoutes);

describe('Post Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  test('POST / - creates a new post', async () => {
    const response = await request(app)
      .post('/api/posts')
      .send({
        title: 'Test Post',
        location: 'Test Location'
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Post created' });
    expect(protect).toHaveBeenCalled();
    expect(postController.createPost).toHaveBeenCalled();
  });
  
  test('GET / - gets user posts', async () => {
    const response = await request(app)
      .get('/api/posts')
      .query({ page: 1, limit: 10 });
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ posts: [] });
    expect(protect).toHaveBeenCalled();
    expect(postController.getUserPosts).toHaveBeenCalled();
  });
  
  test('GET /:id - gets a specific post', async () => {
    const response = await request(app)
      .get('/api/posts/1');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: 1 });
    expect(protect).toHaveBeenCalled();
    expect(postController.getPost).toHaveBeenCalled();
  });
  
  test('PUT /:id - updates a post', async () => {
    const response = await request(app)
      .put('/api/posts/1')
      .send({
        title: 'Updated Post'
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Post updated' });
    expect(protect).toHaveBeenCalled();
    expect(postController.updatePost).toHaveBeenCalled();
  });
  
  test('DELETE /:id - deletes a post', async () => {
    const response = await request(app)
      .delete('/api/posts/1');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Post deleted' });
    expect(protect).toHaveBeenCalled();
    expect(postController.deletePost).toHaveBeenCalled();
  });

});