const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const Lead = require('../models/Lead');
const auth = require('../middleware/auth');
const { generateInsights, clusterTopics } = require('../ml/mlService');

router.get('/dashboard', auth, async (req, res) => {
  try {
    const businessId = req.business._id;
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const today = new Date(now.setHours(0,0,0,0));

    // Total stats
    const [totalChats, totalLeads, recentChats, todayChats] = await Promise.all([
      Chat.countDocuments({ businessId }),
      Lead.countDocuments({ businessId }),
      Chat.find({ businessId, createdAt: { $gte: thirtyDaysAgo } }).lean(),
      Chat.countDocuments({ businessId, createdAt: { $gte: today } }),
    ]);

    // Sentiment breakdown
    const sentimentCounts = {
      positive: recentChats.filter(c => c.sentiment?.label === 'positive').length,
      neutral: recentChats.filter(c => c.sentiment?.label === 'neutral').length,
      negative: recentChats.filter(c => c.sentiment?.label === 'negative').length,
    };

    // Avg response time
    const chatsWithRT = recentChats.filter(c => c.avgResponseTime);
    const avgResponseTime = chatsWithRT.length > 0
      ? Math.round(chatsWithRT.reduce((sum, c) => sum + c.avgResponseTime, 0) / chatsWithRT.length)
      : 0;

    // Daily chat volume (last 7 days)
    const dailyVolume = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0,0,0,0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23,59,59,999);
      const count = await Chat.countDocuments({ businessId, createdAt: { $gte: dayStart, $lte: dayEnd } });
      dailyVolume.push({
        date: dayStart.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        chats: count,
      });
    }

    // Top intents / topics from recent messages
    const allMessages = recentChats.flatMap(c => c.messages || []);
    const topTopics = clusterTopics(allMessages);

    // ML Insights
    const insights = generateInsights(recentChats);

    // Feedback stats
    const chatsWithFeedback = recentChats.filter(c => c.feedback?.rating);
    const avgRating = chatsWithFeedback.length > 0
      ? (chatsWithFeedback.reduce((sum, c) => sum + c.feedback.rating, 0) / chatsWithFeedback.length).toFixed(1)
      : null;

    res.json({
      stats: {
        totalChats,
        totalLeads,
        todayChats,
        recentChats: recentChats.length,
        avgResponseTime,
        avgRating,
      },
      sentimentBreakdown: sentimentCounts,
      dailyVolume,
      topTopics: topTopics.slice(0, 6),
      insights,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
