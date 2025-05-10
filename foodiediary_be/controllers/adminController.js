const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', minRating = 0, approved } = req.query;
    const skip = (page - 1) * parseInt(limit);
    
    const where = {
      rating: {
        gte: parseInt(minRating),
      },
    };
    
    if (approved !== undefined) {
      where.isApproved = approved === 'true';
    }
    
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

exports.updatePostStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;
    
    const updatedPost = await prisma.post.update({
      where: { id: parseInt(id) },
      data: {
        isApproved,
      },
    });
    
    res.status(200).json({
      message: `Post ${isApproved ? 'approved' : 'hidden'} successfully`,
      post: updatedPost,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating post status', error: error.message });
  }
};

exports.getMonthlyStats = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    
    const monthlyStats = await prisma.$queryRaw`
      SELECT 
        EXTRACT(MONTH FROM "eatenAt") as month,
        COUNT(*) as count
      FROM "Post"
      WHERE EXTRACT(YEAR FROM "eatenAt") = ${currentYear}
      GROUP BY month
      ORDER BY month
    `;
    
    // Chuyển đổi giá trị BigInt thành Number
    const formattedStats = monthlyStats.map(stat => ({
      month: Number(stat.month),
      count: Number(stat.count)
    }));
    
    res.status(200).json(formattedStats);
  } catch (error) {
    res.status(500).json({ message: 'Error getting monthly stats', error: error.message });
  }
};

exports.getCityStats = async (req, res) => {
  try {
    const cityStats = await prisma.$queryRaw`
      SELECT 
        SPLIT_PART(location, ',', -1) as city,
        COUNT(*) as count
      FROM "Post"
      GROUP BY city
      ORDER BY count DESC
      LIMIT 10
    `;
    
    const formattedStats = cityStats.map(stat => ({
      city: stat.city.trim(),
      count: Number(stat.count)
    }));
    
    res.status(200).json(formattedStats);
  } catch (error) {
    res.status(500).json({ message: 'Error getting city stats', error: error.message });
  }
};

exports.getMostActiveUsers = async (req, res) => {
  try {
    const activeUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
      orderBy: {
        posts: {
          _count: 'desc',
        },
      },
      take: 10,
    });
    
    res.status(200).json(
      activeUsers.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        postCount: user._count.posts,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: 'Error getting active users', error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });
    
    res.status(200).json(
      users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        postCount: user._count.posts,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: 'Error getting users', error: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        role,
      },
    });
    
    res.status(200).json({
      message: 'User role updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user role', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.post.deleteMany({
      where: { userId: parseInt(id) },
    });
    
    await prisma.user.delete({
      where: { id: parseInt(id) },
    });
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};