const { PrismaClient } = require('@prisma/client');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

const prisma = new PrismaClient();

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { title, location, review, rating, eatenAt } = req.body;
    const userId = req.user.id;
    
    // Upload image to Cloudinary
    let imageUrl = '';
    if (req.file) {
      // Chuyển đổi buffer thành stream để upload lên Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "foodiediary" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        
        // Tạo stream từ buffer và pipe vào uploadStream
        const Readable = require('stream').Readable;
        const fileStream = new Readable();
        fileStream.push(req.file.buffer);
        fileStream.push(null);
        fileStream.pipe(uploadStream);
      });
      
      imageUrl = result.secure_url;
      // Không cần xóa file vì chúng ta không lưu vào đĩa nữa
    }
    
    // Create post
    const post = await prisma.post.create({
      data: {
        title,
        location,
        review,
        rating: parseInt(rating),
        eatenAt: new Date(eatenAt),
        image: imageUrl,
        userId,
        isApproved: false, // Default to not approved
      },
    });
    
    res.status(201).json({
      message: 'Post created successfully',
      post,
    });
  } catch (error) {
    console.error('Error creating post:', error); // Chi tiết lỗi để debug
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
};

// Get user's posts with pagination and filtering
exports.getUserPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, search = '', minRating = 0 } = req.query;
    const skip = (page - 1) * parseInt(limit);
    
    // Build filter conditions
    const where = {
      userId,
      rating: {
        gte: parseInt(minRating),
      },
    };
    
    // Add search condition if provided
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Get posts with pagination
    const posts = await prisma.post.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: {
        eatenAt: 'desc',
      },
    });
    
    // Get total count
    const total = await prisma.post.count({ where });
    
    res.status(200).json({
      posts,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error getting posts', error: error.message });
  }
};

// Get a single post
exports.getPost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if post belongs to user or user is admin
    if (post.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error getting post', error: error.message });
  }
};

// Update a post
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, location, review, rating, eatenAt } = req.body;
    const userId = req.user.id;
    
    // Check if post exists and belongs to user
    const existingPost = await prisma.post.findUnique({
      where: { id: parseInt(id) },
    });
    
    if (!existingPost) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (existingPost.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Handle image upload if provided
    let imageUrl = existingPost.image;
    if (req.file) {
      // Chuyển đổi buffer thành stream để upload lên Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "foodiediary" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        
        // Tạo stream từ buffer và pipe vào uploadStream
        const Readable = require('stream').Readable;
        const fileStream = new Readable();
        fileStream.push(req.file.buffer);
        fileStream.push(null);
        fileStream.pipe(uploadStream);
      });
      
      imageUrl = result.secure_url;
      // Không cần xóa file vì chúng ta không lưu vào đĩa nữa
    }
    
    // Update post
    const updatedPost = await prisma.post.update({
      where: { id: parseInt(id) },
      data: {
        title,
        location,
        review,
        rating: parseInt(rating),
        eatenAt: new Date(eatenAt),
        image: imageUrl,
        isApproved: false, // Reset approval status on update
      },
    });
    
    res.status(200).json({
      message: 'Post updated successfully',
      post: updatedPost,
    });
  } catch (error) {
    console.error('Error updating post:', error); // Thêm log chi tiết để debug
    res.status(500).json({ message: 'Error updating post', error: error.message });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if post exists and belongs to user
    const existingPost = await prisma.post.findUnique({
      where: { id: parseInt(id) },
    });
    
    if (!existingPost) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (existingPost.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Delete post
    await prisma.post.delete({
      where: { id: parseInt(id) },
    });
    
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
};