require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/auth');
const businessRoutes = require('./routes/business');
const chatRoutes = require('./routes/chat');
const analyticsRoutes = require('./routes/analytics');
const leadRoutes = require('./routes/leads');
const faqRoutes = require('./routes/faqs');
const widgetRoutes = require('./routes/widget');
// Socket handler
const socketHandler = require('./controllers/socketController');

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    /http:\/\/localhost:\d+/,
  ],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Chat rate limit (stricter)
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: { error: 'Too many messages, please slow down.' },
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/chat', chatLimiter, chatRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/widget', widgetRoutes);

// Widget JS served for embedding
app.get('/widget.js', (req, res) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const widgetJs = `
(function() {
  var businessId = document.currentScript.getAttribute('data-business-id') || '';
  var iframe = document.createElement('iframe');
  iframe.src = '${clientUrl}/widget/' + businessId;
  iframe.style.cssText = 'position:fixed;bottom:20px;right:20px;width:380px;height:560px;border:none;z-index:999999;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,0.25);';
  iframe.allow = 'microphone';
  document.body.appendChild(iframe);
  
  // Toggle button
  var btn = document.createElement('button');
  btn.innerHTML = '💬';
  btn.style.cssText = 'position:fixed;bottom:20px;right:20px;width:60px;height:60px;border-radius:50%;background:#6366f1;color:white;border:none;font-size:24px;cursor:pointer;z-index:1000000;box-shadow:0 4px 20px rgba(99,102,241,0.5);display:flex;align-items:center;justify-content:center;';
  var open = false;
  iframe.style.display = 'none';
  btn.onclick = function() {
    open = !open;
    iframe.style.display = open ? 'block' : 'none';
    btn.innerHTML = open ? '✕' : '💬';
    if(open) { iframe.style.bottom = '90px'; iframe.style.right = '20px'; }
  };
  document.body.appendChild(btn);
})();
`;
  res.type('application/javascript').send(widgetJs);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SmartChat Assist API is running 🚀', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Socket.IO
socketHandler(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 SmartChat Assist Server running on port ${PORT}`);
  console.log(`📡 Socket.IO ready for real-time connections`);
  console.log(`🌐 API: http://localhost:${PORT}/api`);
  console.log(`💡 Health: http://localhost:${PORT}/api/health\n`);
});

module.exports = { app, io };
