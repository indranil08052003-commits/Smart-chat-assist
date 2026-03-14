const jwt = require('jsonwebtoken');
const Business = require('../models/Business');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided. Please login.' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    const business = await Business.findById(decoded.id).select('-password');
    if (!business || !business.isActive) {
      return res.status(401).json({ error: 'Account not found or deactivated.' });
    }
    
    req.business = business;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please login again.' });
    }
    res.status(401).json({ error: 'Invalid token.' });
  }
};

module.exports = auth;
