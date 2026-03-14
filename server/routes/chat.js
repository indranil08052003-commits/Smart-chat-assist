const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const auth = require('../middleware/auth');
const { json2csv } = require('json2csv');

// Get all chats for business
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, sentiment } = req.query;
    const query = { businessId: req.business._id };
    if (status) query.status = status;
    if (sentiment) query['sentiment.label'] = sentiment;
    
    const chats = await Chat.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-messages');
    
    const total = await Chat.countDocuments(query);
    
    res.json({ chats, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single chat with messages
router.get('/:chatId', auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.chatId, businessId: req.business._id });
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    res.json({ chat });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export chats as CSV
router.get('/export/csv', auth, async (req, res) => {
  try {
    const chats = await Chat.find({ businessId: req.business._id }).lean();
    const data = chats.map(c => ({
      sessionId: c.sessionId,
      visitorName: c.visitorName || '',
      visitorEmail: c.visitorEmail || '',
      messageCount: c.messageCount,
      sentiment: c.sentiment?.label || '',
      status: c.status,
      date: c.createdAt,
    }));
    
    const csv = json2csv(data);
    res.header('Content-Type', 'text/csv');
    res.attachment('chats-export.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
