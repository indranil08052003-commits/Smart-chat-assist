const express = require('express');
const router = express.Router();
const Business = require('../models/Business');

// Public endpoint - get business config for widget (no auth needed)
router.get('/:businessId/config', async (req, res) => {
  try {
    const business = await Business.findById(req.params.businessId)
      .select('businessName chatbotConfig businessType isActive');
    
    if (!business || !business.isActive) {
      return res.status(404).json({ error: 'Business not found' });
    }
    
    res.json({
      businessName: business.businessName,
      botName: business.chatbotConfig?.botName || 'Assistant',
      greeting: business.chatbotConfig?.greeting,
      theme: business.chatbotConfig?.theme || '#6366f1',
      personality: business.chatbotConfig?.personality,
      whatsappNumber: business.chatbotConfig?.whatsappNumber,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
