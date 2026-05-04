const express = require('express');
const prisma = require('../prismaClient');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all tasks for a project
router.get('/project/:projectId', authMiddleware, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { projectId: parseInt(req.params.projectId) },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a task
router.post('/', authMiddleware, async (req, res) => {
  const { title, description, status, priority, dueDate, projectId, assignedTo } = req.body;
  try {
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'TODO',
        priority: priority || 'LOW',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId: parseInt(projectId),
        assignedTo: assignedTo ? parseInt(assignedTo) : null,
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
        project: {
          select: { id: true, name: true },
        },
      },
    });

    // If task is assigned, create notification for the assignee
    if (assignedTo) {
      const assigner = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { name: true },
      });
      await prisma.notification.create({
        data: {
          type: 'TASK_ASSIGNED',
          content: `${assigner.name} assigned you to "${task.title}" in ${task.project.name}`,
          userId: parseInt(assignedTo),
          link: `/kanban/${task.projectId}`,
        },
      });
    }

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a task (status, assignedTo, etc.)
router.put('/:id', authMiddleware, async (req, res) => {
  const { title, description, status, priority, dueDate, assignedTo } = req.body;
  try {
    // Get the old task to check if assignee changed
    const oldTask = await prisma.task.findUnique({
      where: { id: parseInt(req.params.id) },
      select: { assignedTo: true, title: true, projectId: true },
    });

    const task = await prisma.task.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(assignedTo !== undefined && { assignedTo: assignedTo ? parseInt(assignedTo) : null }),
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
        project: {
          select: { id: true, name: true },
        },
      },
    });

    // If assignee changed and there's a new assignee, create notification
    if (assignedTo && parseInt(assignedTo) !== oldTask?.assignedTo) {
      const assigner = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { name: true },
      });
      await prisma.notification.create({
        data: {
          type: 'TASK_ASSIGNED',
          content: `${assigner.name} assigned you to "${task.title}" in ${task.project.name}`,
          userId: parseInt(assignedTo),
          link: `/kanban/${task.projectId}`,
        },
      });
    }

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a task
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.task.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
