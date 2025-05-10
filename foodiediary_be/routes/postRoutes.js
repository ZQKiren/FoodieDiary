const express = require('express');
const postController = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/', protect, upload.single('image'), postController.createPost);
router.get('/', protect, postController.getUserPosts);
router.get('/:id', protect, postController.getPost);
router.put('/:id', protect, upload.single('image'), postController.updatePost);
router.delete('/:id', protect, postController.deletePost);
router.get('/shared/:id', postController.getSharedPost);

module.exports = router;