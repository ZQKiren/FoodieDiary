const request = require('supertest');
const express = require('express');
const postRoutes = require('../../routes/postRoutes');
const { protect } = require('../../middleware/auth');
const postController = require('../../controllers/postController');

jest.mock('../../middleware/auth', () => ({
  protect: jest.fn((req, res, next) => {
    req.user = { id: 1 };
    next();
  })
}));

jest.mock('../../middleware/upload', () => ({
  single: jest.fn(() => (req, res, next) => next())
}));

const mockCreatePost = jest.fn((req, res) => res.json({ message: 'Post created' }));
const mockGetUserPosts = jest.fn((req, res) => res.json({ posts: [] }));
const mockGetPost = jest.fn((req, res) => res.json({ id: 1 }));
const mockUpdatePost = jest.fn((req, res) => res.json({ message: 'Post updated' }));
const mockDeletePost = jest.fn((req, res) => res.json({ message: 'Post deleted' }));
const mockGetSharedPost = jest.fn((req, res) => res.json({ id: 1, isShared: true }));

jest.mock('../../controllers/postController', () => ({
  createPost: (req, res) => mockCreatePost(req, res),
  getUserPosts: (req, res) => mockGetUserPosts(req, res),
  getPost: (req, res) => mockGetPost(req, res),
  updatePost: (req, res) => mockUpdatePost(req, res),
  deletePost: (req, res) => mockDeletePost(req, res),
  getSharedPost: (req, res) => mockGetSharedPost(req, res)
}));

const app = express();
app.use(express.json());
app.use('/api/posts', postRoutes);

describe('Post Routes', () => {
  beforeEach(() => {
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
    expect(mockCreatePost).toHaveBeenCalled();
  });
  
  test('GET / - gets user posts', async () => {
    const response = await request(app)
      .get('/api/posts')
      .query({ page: 1, limit: 10 });
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ posts: [] });
    expect(protect).toHaveBeenCalled();
    expect(mockGetUserPosts).toHaveBeenCalled();
  });
  
  test('GET /:id - gets a specific post', async () => {
    const response = await request(app)
      .get('/api/posts/1');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: 1 });
    expect(protect).toHaveBeenCalled();
    expect(mockGetPost).toHaveBeenCalled();
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
    expect(mockUpdatePost).toHaveBeenCalled();
  });
  
  test('DELETE /:id - deletes a post', async () => {
    const response = await request(app)
      .delete('/api/posts/1');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Post deleted' });
    expect(protect).toHaveBeenCalled();
    expect(mockDeletePost).toHaveBeenCalled();
  });
  
  test('GET /shared/:id - gets a shared post', async () => {
    const response = await request(app)
      .get('/api/posts/shared/1');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: 1, isShared: true });
    expect(mockGetSharedPost).toHaveBeenCalled();
  });
});