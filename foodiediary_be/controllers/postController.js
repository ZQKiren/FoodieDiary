const { PrismaClient } = require('@prisma/client');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

const prisma = new PrismaClient();

exports.createPost = async (req, res) => {
  try {
    const { title, location, review, rating, eatenAt } = req.body;
    const userId = req.user.id;
    
    let imageUrl = '';
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "foodiediary" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        
        const Readable = require('stream').Readable;
        const fileStream = new Readable();
        fileStream.push(req.file.buffer);
        fileStream.push(null);
        fileStream.pipe(uploadStream);
      });
      
      imageUrl = result.secure_url;
    }
    
    const post = await prisma.post.create({
      data: {
        title,
        location,
        review,
        rating: parseInt(rating),
        eatenAt: new Date(eatenAt),
        image: imageUrl,
        userId,
        isApproved: false,
      },
    });
    
    res.status(201).json({
      message: 'Post created successfully',
      post,
    });
  } catch (error) {
    console.error('Error creating post:', error); 
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, search = '', minRating = 0 } = req.query;
    const skip = (page - 1) * parseInt(limit);
    
    const where = {
      userId,
      rating: {
        gte: parseInt(minRating),
      },
    };
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    const posts = await prisma.post.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: {
        eatenAt: 'desc',
      },
    });
    
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
    
    if (post.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error getting post', error: error.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, location, review, rating, eatenAt } = req.body;
    const userId = req.user.id;
    
    const existingPost = await prisma.post.findUnique({
      where: { id: parseInt(id) },
    });
    
    if (!existingPost) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (existingPost.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    let imageUrl = existingPost.image;
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "foodiediary" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        
        const Readable = require('stream').Readable;
        const fileStream = new Readable();
        fileStream.push(req.file.buffer);
        fileStream.push(null);
        fileStream.pipe(uploadStream);
      });
      
      imageUrl = result.secure_url;
    }
    
    const updatedPost = await prisma.post.update({
      where: { id: parseInt(id) },
      data: {
        title,
        location,
        review,
        rating: parseInt(rating),
        eatenAt: new Date(eatenAt),
        image: imageUrl,
        isApproved: false, 
      },
    });
    
    res.status(200).json({
      message: 'Post updated successfully',
      post: updatedPost,
    });
  } catch (error) {
    console.error('Error updating post:', error); 
    res.status(500).json({ message: 'Error updating post', error: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const existingPost = await prisma.post.findUnique({
      where: { id: parseInt(id) },
    });
    
    if (!existingPost) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (existingPost.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await prisma.post.delete({
      where: { id: parseInt(id) },
    });
    
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
};

exports.getSharedPost = async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (!post.isApproved) {
      return res.status(403).json({ message: 'This post is not available' });
    }
    
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error getting post', error: error.message });
  }
};