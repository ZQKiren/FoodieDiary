const express = require('express');
const adminController = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Apply both middleware to all routes
router.use(protect, admin);

// Post management
router.get('/posts', adminController.getAllPosts);
router.patch('/posts/:id/status', adminController.updatePostStatus);

// Statistics
router.get('/stats/monthly', adminController.getMonthlyStats);
router.get('/stats/cities', adminController.getCityStats);
router.get('/stats/users/active', adminController.getMostActiveUsers);

// User management
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;