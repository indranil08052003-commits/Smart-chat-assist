/**
 * ML Service - Intent Classification & Sentiment Analysis
 * Uses rule-based + OpenAI for enhanced ML capabilities
 */

// Intent patterns (rule-based classifier)
const intentPatterns = {
  pricing: {
    patterns: [/price|cost|how much|charge|fee|rate|expensive|cheap|afford|payment|pay/i],
    keywords: ['price', 'cost', 'how much', 'charges', 'fee', 'rate', 'expensive', 'cheap', 'payment'],
  },
  hours: {
    patterns: [/open|close|timing|hours|when.*open|available|schedule|time/i],
    keywords: ['open', 'close', 'timing', 'hours', 'schedule', 'available', 'time'],
  },
  location: {
    patterns: [/where|location|address|directions|find you|map|nearby|area|street/i],
    keywords: ['where', 'location', 'address', 'directions', 'find', 'map', 'nearby'],
  },
  complaint: {
    patterns: [/complaint|problem|issue|bad|terrible|awful|worst|disappointed|not working|broken|frustrated/i],
    keywords: ['complaint', 'problem', 'issue', 'bad', 'terrible', 'disappointed', 'broken'],
  },
  booking: {
    patterns: [/book|reserve|appointment|schedule|order|buy|purchase|order/i],
    keywords: ['book', 'reserve', 'appointment', 'schedule', 'order', 'purchase'],
  },
  delivery: {
    patterns: [/deliver|shipping|ship|track|order status|when.*arrive|dispatch/i],
    keywords: ['deliver', 'shipping', 'track', 'dispatch', 'arrive'],
  },
  contact: {
    patterns: [/contact|call|email|reach|talk.*person|human|agent|phone|number/i],
    keywords: ['contact', 'call', 'email', 'reach', 'human', 'agent', 'phone'],
  },
  services: {
    patterns: [/service|offer|provide|do you have|what.*you do|product|menu/i],
    keywords: ['service', 'offer', 'provide', 'product', 'menu'],
  },
  greeting: {
    patterns: [/^(hi|hello|hey|good morning|good evening|howdy|greetings)/i],
    keywords: ['hi', 'hello', 'hey'],
  },
  farewell: {
    patterns: [/^(bye|goodbye|thanks|thank you|see you|later|done|that's all)/i],
    keywords: ['bye', 'goodbye', 'thanks', 'done'],
  },
};

// Classify intent from user message
const classifyIntent = (message) => {
  const lowerMsg = message.toLowerCase();
  let bestIntent = 'general';
  let bestScore = 0;

  for (const [intent, config] of Object.entries(intentPatterns)) {
    let score = 0;
    
    // Pattern matching
    for (const pattern of config.patterns) {
      if (pattern.test(lowerMsg)) score += 3;
    }
    
    // Keyword matching
    for (const keyword of config.keywords) {
      if (lowerMsg.includes(keyword)) score += 1;
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  const confidence = Math.min(bestScore / 5, 1);
  return { intent: bestIntent, confidence: parseFloat(confidence.toFixed(2)) };
};

// Sentiment analysis (VADER-like rule-based)
const sentimentWords = {
  positive: [
    'great', 'awesome', 'excellent', 'perfect', 'amazing', 'wonderful', 'fantastic',
    'good', 'nice', 'helpful', 'happy', 'love', 'best', 'thanks', 'thank you',
    'satisfied', 'pleased', 'brilliant', 'outstanding', 'superb', 'impressed',
  ],
  negative: [
    'bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'angry', 'frustrated',
    'disappointed', 'useless', 'broken', 'poor', 'pathetic', 'disgusting', 'failed',
    'issue', 'problem', 'complaint', 'wrong', 'never', 'scam', 'fraud', 'rude',
  ],
  intensifiers: ['very', 'so', 'extremely', 'really', 'absolutely', 'completely', 'totally'],
  negators: ['not', "don't", "doesn't", 'never', 'no', 'without'],
};

const analyzeSentiment = (text) => {
  const words = text.toLowerCase().split(/\s+/);
  let score = 0;
  let totalWeight = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i].replace(/[^a-z]/g, '');
    const prevWord = i > 0 ? words[i - 1].replace(/[^a-z]/g, '') : '';
    const isNegated = sentimentWords.negators.includes(prevWord);
    const isIntensified = sentimentWords.intensifiers.includes(prevWord);
    const multiplier = isIntensified ? 1.5 : 1;

    if (sentimentWords.positive.includes(word)) {
      score += isNegated ? -1 * multiplier : 1 * multiplier;
      totalWeight++;
    } else if (sentimentWords.negative.includes(word)) {
      score += isNegated ? 1 * multiplier : -1 * multiplier;
      totalWeight++;
    }
  }

  const normalizedScore = totalWeight > 0 ? score / totalWeight : 0;
  
  let label;
  if (normalizedScore > 0.1) label = 'positive';
  else if (normalizedScore < -0.1) label = 'negative';
  else label = 'neutral';

  return {
    score: parseFloat(normalizedScore.toFixed(3)),
    label,
  };
};

// Analyze full conversation sentiment
const analyzeConversationSentiment = (messages) => {
  const userMessages = messages.filter(m => m.role === 'user').map(m => m.content);
  if (!userMessages.length) return { score: 0, label: 'neutral' };
  
  const combined = userMessages.join(' ');
  return analyzeSentiment(combined);
};

// Check if handoff needed
const shouldHandoff = (messages, threshold = 2) => {
  const recentUserMessages = messages
    .filter(m => m.role === 'user')
    .slice(-5);
  
  const sensitiveCount = recentUserMessages.filter(m => {
    const { intent } = classifyIntent(m.content);
    const { label } = analyzeSentiment(m.content);
    return intent === 'complaint' || intent === 'contact' || label === 'negative';
  }).length;
  
  return sensitiveCount >= threshold;
};

// Cluster/categorize frequently asked topics
const clusterTopics = (messages) => {
  const intentCounts = {};
  messages.forEach(m => {
    if (m.role === 'user') {
      const { intent } = classifyIntent(m.content);
      intentCounts[intent] = (intentCounts[intent] || 0) + 1;
    }
  });
  
  return Object.entries(intentCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([intent, count]) => ({ intent, count }));
};

// Generate chat coach insights
const generateInsights = (chats) => {
  const insights = [];
  
  // Negative sentiment alert
  const negativeChats = chats.filter(c => c.sentiment?.label === 'negative');
  if (negativeChats.length >= 3) {
    insights.push({
      type: 'alert',
      message: `⚠️ ${negativeChats.length} recent chats had negative sentiment. Review and improve responses.`,
    });
  }
  
  // Most asked intent
  const allMessages = chats.flatMap(c => c.messages || []);
  const topics = clusterTopics(allMessages);
  if (topics[0]) {
    insights.push({
      type: 'info',
      message: `📊 Most asked about: "${topics[0].intent}" (${topics[0].count} times). Make sure your FAQ covers this.`,
    });
  }
  
  // Low FAQ coverage
  const generalCount = topics.find(t => t.intent === 'general')?.count || 0;
  if (generalCount > 5) {
    insights.push({
      type: 'suggestion',
      message: `💡 ${generalCount} questions couldn't be categorized. Consider adding more specific FAQs.`,
    });
  }
  
  return insights;
};

module.exports = {
  classifyIntent,
  analyzeSentiment,
  analyzeConversationSentiment,
  shouldHandoff,
  clusterTopics,
  generateInsights,
};
