const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  intent: { type: String }, // ML-classified intent
  confidence: { type: Number }, // ML confidence score
});

const chatSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  sessionId: { type: String, required: true, index: true },
  
  // Visitor info
  visitorName: { type: String },
  visitorEmail: { type: String },
  visitorPhone: { type: String },
  
  messages: [messageSchema],
  
  // ML Analytics
  overallIntent: { type: String },
  sentiment: {
    score: { type: Number }, // -1 to 1
    label: { type: String, enum: ['positive', 'neutral', 'negative'] },
  },
  
  // Chat stats
  messageCount: { type: Number, default: 0 },
  avgResponseTime: { type: Number }, // milliseconds
  duration: { type: Number }, // seconds
  
  // Status
  status: { type: String, enum: ['active', 'closed', 'handed_off'], default: 'active' },
  handedOffTo: { type: String, enum: ['whatsapp', 'human', null], default: null },
  
  // Feedback
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    submittedAt: { type: Date },
  },
  
  isLead: { type: Boolean, default: false },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  
}, { timestamps: true });

// Index for analytics queries
chatSchema.index({ businessId: 1, createdAt: -1 });
chatSchema.index({ businessId: 1, 'sentiment.label': 1 });

module.exports = mongoose.model('Chat', chatSchema);
