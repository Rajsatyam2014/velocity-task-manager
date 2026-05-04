const express = require('express');
const prisma = require('../prismaClient');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get conversations list (unique users the current user has messaged with)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all messages involving the current user
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        receiver: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by conversation partner
    const conversationMap = {};
    messages.forEach(msg => {
      const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!conversationMap[partnerId]) {
        const partner = msg.senderId === userId ? msg.receiver : msg.sender;
        conversationMap[partnerId] = {
          partner,
          lastMessage: msg.content,
          lastMessageAt: msg.createdAt,
          unreadCount: 0,
        };
      }
      if (msg.receiverId === userId && !msg.read) {
        conversationMap[partnerId].unreadCount++;
      }
    });

    const conversations = Object.values(conversationMap).sort(
      (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
    );

    res.json(conversations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get message thread with a specific user
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = parseInt(req.params.userId);

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: currentUserId },
        ],
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Mark messages from the other user as read
    await prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: currentUserId,
        read: false,
      },
      data: { read: true },
    });

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send a message
router.post('/', authMiddleware, async (req, res) => {
  const { receiverId, content } = req.body;
  try {
    const senderId = req.user.id;

    // Get sender name
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { name: true },
    });

    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId: parseInt(receiverId),
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        receiver: { select: { id: true, name: true, email: true } },
      },
    });

    // Create a notification for the receiver
    await prisma.notification.create({
      data: {
        type: 'MESSAGE',
        content: `New message from ${sender.name}: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
        userId: parseInt(receiverId),
        link: '/messages',
      },
    });

    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark a message as read
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const message = await prisma.message.update({
      where: { id: parseInt(req.params.id) },
      data: { read: true },
    });
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
