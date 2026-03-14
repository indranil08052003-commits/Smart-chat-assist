const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const businessSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  businessName: { type: String, required: true, trim: true },
  businessType: { type: String, default: 'General' },
  phone: { type: String },
  website: { type: String },
  
  // Chatbot configuration
  chatbotConfig: {
    greeting: { type: String, default: 'Hi! How can I help you today? 😊' },
    theme: { type: String, default: '#6366f1' },
    personality: { type: String, enum: ['formal', 'friendly', 'witty'], default: 'friendly' },
    autoWhatsappHandoff: { type: Boolean, default: false },
    whatsappNumber: { type: String },
    botName: { type: String, default: 'Assistant' },
    language: { type: String, default: 'en' },
  },
  
  // Business info for AI context
  businessInfo: {
    openingHours: { type: String, default: 'Monday-Friday 9AM-6PM' },
    address: { type: String },
    services: { type: String },
    pricing: { type: String },
    deliveryOptions: { type: String },
    specialOffers: { type: String },
  },
  
  // Subscription
  plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
  apiCallsThisMonth: { type: Number, default: 0 },
  
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
}, { timestamps: true });

businessSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

businessSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

businessSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('Business', businessSchema);
