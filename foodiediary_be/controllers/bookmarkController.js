const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.toggleBookmark = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user.id;
    
    if (!postId) {
      return res.status(400).json({ message: 'Post ID is required' });
    }
    
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
    });
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: userId,
          postId: parseInt(postId),
        },
      },
    });
    
    let result;
    let message;
    
    if (existingBookmark) {
      result = await prisma.bookmark.delete({
        where: {
          id: existingBookmark.id,
        },
      });
      message = 'Bookmark removed successfully';
    } else {
      result = await prisma.bookmark.create({
        data: {
          userId: userId,
          postId: parseInt(postId),
        },
      });
      message = 'Bookmark added successfully';
    }
    
    res.status(200).json({
      message,
      isBookmarked: !existingBookmark,
      bookmark: result,
    });
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    res.status(500).json({ message: 'Error toggling bookmark', error: error.message });
  }
};

exports.getUserBookmarks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * parseInt(limit);
    
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      skip,
      take: parseInt(limit),
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        post: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
    
    const total = await prisma.bookmark.count({ where: { userId } });
    

    const posts = bookmarks.map(bookmark => ({
      ...bookmark.post,
      bookmarkedAt: bookmark.createdAt,
    }));
    
    res.status(200).json({
      posts,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error('Error getting bookmarks:', error);
    res.status(500).json({ message: 'Error getting bookmarks', error: error.message });
  }
};

exports.checkBookmark = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: userId,
          postId: parseInt(postId),
        },
      },
    });
    
    res.status(200).json({
      isBookmarked: !!bookmark,
    });
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    res.status(500).json({ message: 'Error checking bookmark status', error: error.message });
  }
};