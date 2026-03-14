const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Business = require('../models/Business');
const auth = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, businessName, businessType } = req.body;
    
    if (!name || !email || !password || !businessName) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    const existing = await Business.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ error: 'Email already registered' });
    
    const business = await Business.create({ name, email, password, businessName, businessType });
    
    const token = jwt.sign(
      { id: business._id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'Account created successfully!',
      token,
      business: business.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    
    const business = await Business.findOne({ email: email.toLowerCase() });
    if (!business) return res.status(401).json({ error: 'Invalid email or password' });
    
    const isMatch = await business.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });
    
    await Business.findByIdAndUpdate(business._id, { lastLogin: new Date() });
    
    const token = jwt.sign(
      { id: business._id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );
    
    res.json({ message: 'Login successful!', token, business: business.toJSON() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get('/me', auth, (req, res) => {
  res.json({ business: req.business });
});

module.exports = router;
