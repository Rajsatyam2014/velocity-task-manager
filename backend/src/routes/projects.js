const express = require('express');
const prisma = require('../prismaClient');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all projects (with task stats)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { tasks: true },
        },
        tasks: {
          select: { status: true, dueDate: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Compute stats per project
    const projectsWithStats = projects.map(p => {
      const total = p.tasks.length;
      const done = p.tasks.filter(t => t.status === 'DONE').length;
      const progress = total > 0 ? Math.round((done / total) * 100) : 0;
      const nearestDue = p.tasks
        .filter(t => t.dueDate && t.status !== 'DONE')
        .map(t => new Date(t.dueDate))
        .sort((a, b) => a - b)[0] || null;

      const { tasks, ...rest } = p;
      return { ...rest, progress, nearestDue };
    });

    res.json(projectsWithStats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new project (Admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  const { name, description } = req.body;
  try {
    const project = await prisma.project.create({
      data: {
        name,
        description,
        createdById: req.user.id,
      },
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a specific project
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        tasks: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a project (Admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await prisma.project.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
