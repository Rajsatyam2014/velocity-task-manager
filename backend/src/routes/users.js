const express = require('express');
const bcrypt = require('bcrypt');
const prisma = require('../prismaClient');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all users (Team members)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Dashboard Analytics
router.get('/analytics', authMiddleware, async (req, res) => {
  try {
    const totalTasks = await prisma.task.count();
    const completedTasks = await prisma.task.count({ where: { status: 'DONE' } });
    const pendingTasks = await prisma.task.count({ where: { status: { in: ['TODO', 'IN_PROGRESS', 'TESTING'] } } });
    const overdueTasks = await prisma.task.count({
      where: {
        status: { not: 'DONE' },
        dueDate: { lt: new Date() },
      },
    });
    const totalMembers = await prisma.user.count();

    res.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      totalMembers,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  const { name, bio } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(bio !== undefined && { bio }),
      },
      select: { id: true, name: true, email: true, role: true, bio: true },
    });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Change password
router.put('/password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Invite a new team member
router.post('/invite', authMiddleware, async (req, res) => {
  const { name, email, role } = req.body;
  try {
    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create with a default password (user can change later)
    const tempPassword = 'Welcome@123';
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'MEMBER',
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    // Create notification for the inviter
    await prisma.notification.create({
      data: {
        type: 'INVITE',
        content: `${name} has been invited to the team. Default password: ${tempPassword}`,
        userId: req.user.id,
        link: '/team',
      },
    });

    // Create welcome notification for new user
    await prisma.notification.create({
      data: {
        type: 'SYSTEM',
        content: `Welcome to Velocity! Your account has been created. Please update your password in Settings.`,
        userId: newUser.id,
        link: '/settings',
      },
    });

    res.status(201).json({ user: newUser, tempPassword });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Search across projects and tasks
router.get('/search', authMiddleware, async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.json({ projects: [], tasks: [], users: [] });

  try {
    const [projects, tasks, users] = await Promise.all([
      prisma.project.findMany({
        where: { name: { contains: q, mode: 'insensitive' } },
        select: { id: true, name: true, description: true },
        take: 5,
      }),
      prisma.task.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, title: true, status: true, projectId: true },
        take: 5,
      }),
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, name: true, email: true },
        take: 5,
      }),
    ]);

    res.json({ projects, tasks, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
