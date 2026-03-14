const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  question: { type: String, required: true, trim: true },
  answer: { type: String, required: true, trim: true },
  category: { type: String, default: 'general' },
  tags: [String],
  isActive: { type: Boolean, default: true },
  useCount: { type: Number, default: 0 },
}, { timestamps: true });

faqSchema.index({ businessId: 1 });

module.exports = mongoose.model('FAQ', faqSchema);
