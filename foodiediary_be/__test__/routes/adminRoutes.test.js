// test/routes/adminRoutes.test.js
const request = require('supertest');
const express = require('express');
const adminRoutes = require('../../routes/adminRoutes');
const { protect, admin } = require('../../middleware/auth');
const adminController = require('../../controllers/adminController');

// Mock dependencies
jest.mock('../../middleware/auth', () => ({
  protect: jest.fn((req, res, next) => {
    req.user = { id: 1, role: 'admin' };
    next();
  }),
  admin: jest.fn((req, res, next) => {
    next();
  })
}));

jest.mock('../../controllers/adminController', () => ({
  getAllPosts: jest.fn((req, res) => res.json({ posts: [] })),
  updatePostStatus: jest.fn((req, res) => res.json({ message: 'Post status updated' })),
  getMonthlyStats: jest.fn((req, res) => res.json([{ month: 1, count: 5 }])),
  getCityStats: jest.fn((req, res) => res.json([{ city: 'New York', count: 10 }])),
  getMostActiveUsers: jest.fn((req, res) => res.json([{ id: 1, name: 'Test User', postCount: 10 }])),
  getAllUsers: jest.fn((req, res) => res.json([{ id: 1, name: 'Test User', role: 'user' }])),
  updateUserRole: jest.fn((req, res) => res.json({ message: 'User role updated' })),
  deleteUser: jest.fn((req, res) => res.json({ message: 'User deleted' }))
}));

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/admin', adminRoutes);

describe('Admin Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  test('GET /posts - gets all posts', async () => {
    const response = await request(app)
      .get('/api/admin/posts')
      .query({ page: 1, limit: 10 });
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ posts: [] });
    expect(protect).toHaveBeenCalled();
    expect(admin).toHaveBeenCalled();
    expect(adminController.getAllPosts).toHaveBeenCalled();
  });
  
  test('PATCH /posts/:id/status - updates post status', async () => {
    const response = await request(app)
      .patch('/api/admin/posts/5/status')
      .send({ isApproved: true });
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Post status updated' });
    expect(protect).toHaveBeenCalled();
    expect(admin).toHaveBeenCalled();
    expect(adminController.updatePostStatus).toHaveBeenCalled();
  });
  
  test('GET /stats/monthly - gets monthly stats', async () => {
    const response = await request(app)
      .get('/api/admin/stats/monthly');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ month: 1, count: 5 }]);
    expect(protect).toHaveBeenCalled();
    expect(admin).toHaveBeenCalled();
    expect(adminController.getMonthlyStats).toHaveBeenCalled();
  });
  
  test('GET /stats/cities - gets city stats', async () => {
    const response = await request(app)
      .get('/api/admin/stats/cities');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ city: 'New York', count: 10 }]);
    expect(protect).toHaveBeenCalled();
    expect(admin).toHaveBeenCalled();
    expect(adminController.getCityStats).toHaveBeenCalled();
  });
  
  test('GET /stats/users/active - gets most active users', async () => {
    const response = await request(app)
      .get('/api/admin/stats/users/active');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id: 1, name: 'Test User', postCount: 10 }]);
    expect(protect).toHaveBeenCalled();
    expect(admin).toHaveBeenCalled();
    expect(adminController.getMostActiveUsers).toHaveBeenCalled();
  });
  
  test('GET /users - gets all users', async () => {
    const response = await request(app)
      .get('/api/admin/users');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id: 1, name: 'Test User', role: 'user' }]);
    expect(protect).toHaveBeenCalled();
    expect(admin).toHaveBeenCalled();
    expect(adminController.getAllUsers).toHaveBeenCalled();
  });
  
  test('PATCH /users/:id/role - updates user role', async () => {
    const response = await request(app)
      .patch('/api/admin/users/2/role')
      .send({ role: 'admin' });
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'User role updated' });
    expect(protect).toHaveBeenCalled();
    expect(admin).toHaveBeenCalled();
    expect(adminController.updateUserRole).toHaveBeenCalled();
  });
  
  test('DELETE /users/:id - deletes a user', async () => {
    const response = await request(app)
      .delete('/api/admin/users/2');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'User deleted' });
    expect(protect).toHaveBeenCalled();
    expect(admin).toHaveBeenCalled();
    expect(adminController.deleteUser).toHaveBeenCalled();
  });
});