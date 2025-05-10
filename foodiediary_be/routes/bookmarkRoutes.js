const express = require('express');
const bookmarkController = require('../controllers/bookmarkController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/toggle', protect, bookmarkController.toggleBookmark);
router.get('/', protect, bookmarkController.getUserBookmarks);
router.get('/:postId', protect, bookmarkController.checkBookmark);

module.exports = router;