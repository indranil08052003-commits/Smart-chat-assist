const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const auth = require('../middleware/auth');
const { json2csv } = require('json2csv');

router.get('/', auth, async (req, res) => {
  try {
    const leads = await Lead.find({ businessId: req.business._id })
      .sort({ createdAt: -1 })
      .populate('chatId', 'sessionId messageCount');
    res.json({ leads });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/status', auth, async (req, res) => {
  try {
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, businessId: req.business._id },
      { status: req.body.status, notes: req.body.notes },
      { new: true }
    );
    res.json({ lead });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/export/csv', auth, async (req, res) => {
  try {
    const leads = await Lead.find({ businessId: req.business._id }).lean();
    const data = leads.map(l => ({
      name: l.name || '',
      email: l.email || '',
      phone: l.phone || '',
      status: l.status,
      date: l.createdAt,
    }));
    const csv = json2csv(data);
    res.header('Content-Type', 'text/csv');
    res.attachment('leads.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
