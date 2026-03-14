const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
  name: { type: String },
  email: { type: String },
  phone: { type: String },
  message: { type: String },
  source: { type: String, default: 'chatbot' },
  status: { type: String, enum: ['new', 'contacted', 'converted', 'lost'], default: 'new' },
  notes: { type: String },
}, { timestamps: true });

leadSchema.index({ businessId: 1, createdAt: -1 });

module.exports = mongoose.model('Lead', leadSchema);
