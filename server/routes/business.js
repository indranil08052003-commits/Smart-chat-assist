const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const auth = require('../middleware/auth');

// Get business profile
router.get('/profile', auth, async (req, res) => {
  res.json({ business: req.business });
});

// Update business profile
router.put('/profile', auth, async (req, res) => {
  try {
    const allowed = ['businessName', 'businessType', 'phone', 'website', 'businessInfo', 'chatbotConfig'];
    const updates = {};
    allowed.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    
    const updated = await Business.findByIdAndUpdate(
      req.business._id, { $set: updates }, { new: true }
    ).select('-password');
    
    res.json({ message: 'Profile updated!', business: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get embed code
router.get('/embed-code', auth, (req, res) => {
  const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  
  res.json({
    scriptTag: `<script src="${serverUrl}/widget.js" data-business-id="${req.business._id}" async></script>`,
    iframeTag: `<iframe src="${clientUrl}/widget/${req.business._id}" style="width:380px;height:560px;border:none;border-radius:16px;" title="Chat Widget"></iframe>`,
    businessId: req.business._id,
  });
});

module.exports = router;
