# 🤖 SmartChat Assist

> **AI + ML-Powered Customer Support Chatbot for Local Businesses**

SmartChat Assist is a full-stack MERN application that gives small businesses a powerful AI chatbot for customer support. It features GPT-4 integration, ML-based intent classification, sentiment analysis, lead capture, real-time chat, and an embeddable widget for any website — including WordPress.

---

## 📸 What You Get

| Feature | Description |
|---------|-------------|
| 🤖 AI Chat Widget | GPT-powered chatbot embeddable on any website |
| 📊 Admin Dashboard | Manage FAQs, view chats, analytics |
| 🧠 ML Intent Detection | Classifies user intent (pricing, hours, complaints, etc.) |
| 💬 Sentiment Analysis | Real-time mood tracking on conversations |
| 👥 Lead Capture | Auto-capture visitor name/email from chat |
| 📈 Analytics Panel | Charts for chat volume, sentiment, topics |
| 💡 AI Coach | Smart insights to improve your chatbot |
| 📱 WhatsApp Handoff | Auto-route frustrated users to WhatsApp |
| 🔌 Embeddable Widget | One script tag to add to any website |

---

## 🛠 Tech Stack

**Frontend:** React.js, React Router, Socket.IO Client, Recharts, React Hot Toast  
**Backend:** Node.js, Express.js, Socket.IO Server, JWT Authentication  
**Database:** MongoDB (via Mongoose)  
**AI/ML:** OpenAI GPT-4o-mini, Custom Rule-Based ML (Intent + Sentiment)  
**Integrations:** Twilio WhatsApp (optional), Nodemailer (optional)

---

## ⚡ Quick Start (Step-by-Step)

### Prerequisites — Install These First

1. **Node.js** (v18 or higher)  
   → Download from: https://nodejs.org  
   → Verify: `node --version` (should show v18+)

2. **MongoDB** (local or cloud)  
   → **Option A - Local:** Download from https://mongodb.com/try/download/community  
   → **Option B - Free Cloud (Recommended):** Sign up at https://cloud.mongodb.com (free tier)

3. **OpenAI API Key**  
   → Get from: https://platform.openai.com/api-keys  
   → You need a paid account ($5 minimum credit)

4. **Git** (optional, for cloning)

---

### Step 1: Download / Extract the Project

If you have the zip file, extract it. You should have:
```
smartchat-assist/
├── client/          ← React frontend
├── server/          ← Node.js backend
├── package.json
└── README.md
```

---

### Step 2: Install Dependencies

Open terminal in the `smartchat-assist` folder:

```bash
# Install all dependencies (root + client + server)
npm run install:all
```

This installs packages for all three levels. Wait 2-3 minutes.

Alternatively, install manually:
```bash
# Root
npm install

# Frontend
cd client
npm install
cd ..

# Backend
cd server
npm install
cd ..
```

---

### Step 3: Configure Environment Variables

#### Backend (.env)
```bash
cd server
cp .env.example .env
```

Now open `server/.env` and fill in:

```env
PORT=5000
NODE_ENV=development

# MongoDB URI - choose one:
# Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/smartchat-assist

# MongoDB Atlas (cloud - replace with your connection string):
# MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/smartchat-assist

# JWT Secret - use any long random string
JWT_SECRET=mysupersecretkey2024changeThis

# OpenAI API Key (REQUIRED for AI chat to work)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Frontend URL (don't change for local dev)
CLIENT_URL=http://localhost:3000
```

#### Frontend (.env)
```bash
cd client
cp .env.example .env
```

`client/.env` content (defaults work for local development):
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

### Step 4: Start MongoDB

**If using local MongoDB:**
```bash
# Windows:
net start MongoDB

# Mac:
brew services start mongodb-community

# Linux:
sudo systemctl start mongod
```

**If using MongoDB Atlas:** No action needed — just use the connection string in .env

---

### Step 5: Run the Application

From the root `smartchat-assist` folder:

```bash
# Run both frontend and backend simultaneously
npm run dev
```

This starts:
- **Backend** at http://localhost:5000
- **Frontend** at http://localhost:3000

You should see:
```
🚀 SmartChat Assist Server running on port 5000
✅ MongoDB Connected: localhost
```

---

### Step 6: Create Your Account

1. Open browser → http://localhost:3000
2. Click "Create one free" to register
3. Fill in your name, business name, email, password
4. You'll land on the Dashboard

---

### Step 7: Configure Your Chatbot

1. Go to **Settings** in the sidebar
2. Fill in **Business Information:**
   - Opening hours, address, services, pricing
   - This is used by AI to answer customer questions
3. Configure **Chatbot:**
   - Bot name, personality, greeting message
4. Choose **Widget color** to match your brand
5. Click **Save Changes**

---

### Step 8: Add FAQs

1. Go to **FAQ Manager**
2. Click **AI Auto-Generate** to automatically create FAQs from your business info
3. Or manually add question-answer pairs
4. These train the chatbot to answer accurately

---

### Step 9: Test Your Chatbot

1. Get your Business ID from **Dashboard → Embed Your Chatbot**
2. Open: `http://localhost:3000/widget/YOUR_BUSINESS_ID`
3. Chat with your bot!
4. Return to Dashboard to see chat logs and analytics

---

## 🌐 Embedding on a Website

### Any Website (HTML)
```html
<!-- Paste before </body> tag -->
<script src="http://localhost:5000/widget.js" data-business-id="YOUR_BUSINESS_ID" async></script>
```

### WordPress
**Method 1 - Custom HTML Block:**
1. Open any page in Gutenberg editor
2. Add a "Custom HTML" block
3. Paste the iframe code from Dashboard

**Method 2 - Every Page (Floating Widget):**
1. Install plugin: "Insert Headers and Footers" (WPCode)
2. Go to Settings → WPCode
3. In "Body" section, paste the `<script>` tag
4. Save → Widget appears on all pages

### iFrame Embed
```html
<iframe 
  src="http://localhost:5000/widget/YOUR_BUSINESS_ID"
  style="width:380px;height:560px;border:none;border-radius:16px;"
  title="Chat Support">
</iframe>
```

---

## 🚀 Deploying to Production

### Option A: Render.com (Free tier available)

**Backend:**
1. Push code to GitHub
2. Go to https://render.com → New Web Service
3. Connect your repo → select `server` folder
4. Build command: `npm install`
5. Start command: `node index.js`
6. Add environment variables from `.env`

**Frontend:**
1. New Static Site on Render
2. Connect repo → select `client` folder  
3. Build command: `npm run build`
4. Publish directory: `build`
5. Add env var: `REACT_APP_API_URL=https://your-backend.onrender.com`

### Option B: Vercel (Frontend) + Railway (Backend)

**Frontend → Vercel:**
```bash
cd client
npx vercel
```

**Backend → Railway:**
```bash
npm install -g @railway/cli
cd server
railway up
```

### Option C: VPS (DigitalOcean / Linode)
1. SSH into your VPS
2. Install Node.js and MongoDB
3. Clone/upload code
4. Run with PM2: `npm install -g pm2 && pm2 start server/index.js`
5. Set up Nginx as reverse proxy

---

## 📁 Project Structure

```
smartchat-assist/
├── client/                          ← React Frontend
│   └── src/
│       ├── pages/
│       │   ├── Login.js             ← Login page
│       │   ├── Register.js          ← Registration
│       │   ├── Dashboard.js         ← Main dashboard
│       │   ├── FAQManager.js        ← FAQ management
│       │   ├── ChatHistory.js       ← View all chats
│       │   ├── Leads.js             ← Lead management
│       │   ├── Analytics.js         ← Charts & analytics
│       │   ├── Settings.js          ← Business & bot config
│       │   └── WidgetPage.js        ← Embeddable chat UI
│       ├── components/
│       │   └── Layout.js            ← Sidebar navigation
│       ├── context/
│       │   └── AuthContext.js       ← Auth state management
│       └── utils/
│           └── api.js               ← Axios instance
│
├── server/                          ← Node.js Backend
│   ├── index.js                     ← Entry point
│   ├── config/
│   │   └── db.js                    ← MongoDB connection
│   ├── models/
│   │   ├── Business.js              ← Business/user model
│   │   ├── Chat.js                  ← Chat session model
│   │   ├── FAQ.js                   ← FAQ model
│   │   └── Lead.js                  ← Lead capture model
│   ├── routes/
│   │   ├── auth.js                  ← Login/Register
│   │   ├── business.js              ← Profile & embed code
│   │   ├── chat.js                  ← Chat history & export
│   │   ├── analytics.js             ← Dashboard analytics
│   │   ├── faqs.js                  ← FAQ CRUD + AI generate
│   │   ├── leads.js                 ← Lead management
│   │   └── widget.js                ← Public widget config
│   ├── controllers/
│   │   └── socketController.js      ← Real-time chat logic
│   └── ml/
│       ├── mlService.js             ← Intent + Sentiment ML
│       └── openaiService.js         ← GPT integration
│
└── README.md
```

---

## 🧠 ML Features Explained

### Intent Classification
Every user message is automatically classified into:
- `pricing` — price/cost questions
- `hours` — opening time questions
- `location` — address/directions
- `complaint` — negative feedback
- `booking` — reservations/orders
- `delivery` — shipping/tracking
- `contact` — requesting human agent
- `services` — product/service inquiries
- `general` — uncategorized

### Sentiment Analysis
Analyzes user messages using:
- Positive/negative keyword detection
- Negation handling ("not good" → negative)
- Intensity multipliers ("very bad" → more negative)
- Conversation-level aggregation

### Auto WhatsApp Handoff
Triggers when:
- User sends 2+ complaint/contact messages
- Sentiment is consistently negative
- If `autoWhatsappHandoff` is enabled in Settings

### AI Coach Insights
Analyzes your chat history to provide:
- Alerts when negative sentiment spikes
- Tips about most-asked topics
- Suggestions to improve FAQ coverage

---

## 🔌 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Get JWT token |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/business/profile` | Yes | Get profile |
| PUT | `/api/business/profile` | Yes | Update profile |
| GET | `/api/business/embed-code` | Yes | Get embed code |
| GET | `/api/faqs` | Yes | List FAQs |
| POST | `/api/faqs` | Yes | Add FAQ |
| POST | `/api/faqs/auto-generate` | Yes | AI generate FAQs |
| DELETE | `/api/faqs/:id` | Yes | Delete FAQ |
| GET | `/api/chat` | Yes | Get chat history |
| GET | `/api/chat/export/csv` | Yes | Export chats |
| GET | `/api/analytics/dashboard` | Yes | Get analytics |
| GET | `/api/leads` | Yes | Get leads |
| GET | `/api/leads/export/csv` | Yes | Export leads |
| GET | `/api/widget/:id/config` | No | Public widget config |
| GET | `/widget.js` | No | Widget embed script |
| GET | `/api/health` | No | Health check |

---

## 🔧 Troubleshooting

**"MongoDB connection error"**
- Make sure MongoDB is running locally, or check your Atlas connection string
- Ensure IP whitelist on Atlas allows your IP (use 0.0.0.0/0 for dev)

**"Invalid API key" from OpenAI**
- Verify `OPENAI_API_KEY` in `server/.env` is correct
- Check you have credits at https://platform.openai.com/usage

**Chat widget shows "Reconnecting"**
- Check server is running on port 5000
- Check `REACT_APP_SOCKET_URL` in `client/.env`

**"Cannot find module" error**
- Run `npm run install:all` again from root directory

**Port already in use**
- Change PORT in `server/.env` (e.g. `PORT=5001`)
- Update `REACT_APP_API_URL` in `client/.env` accordingly

---

## 💰 Estimated API Costs

Using `gpt-4o-mini` model (very affordable):
- ~100 chat messages = $0.01 - $0.03
- 1000 chats/month ≈ $1-3/month

---

## 📋 Final Year Project Checklist

- [x] Working web application
- [x] Real-time chat with Socket.IO
- [x] GPT-4 AI integration
- [x] ML intent classification
- [x] ML sentiment analysis
- [x] Business dashboard
- [x] FAQ management with AI generation
- [x] Lead capture & management
- [x] Analytics with charts
- [x] Embeddable widget
- [x] WordPress compatible
- [x] JWT authentication
- [x] CSV export
- [x] WhatsApp handoff
- [x] Rate limiting & security

---

## 👨‍💻 Built With

- [React](https://reactjs.org) — Frontend UI
- [Node.js](https://nodejs.org) — Backend runtime
- [Express](https://expressjs.com) — API framework
- [Socket.IO](https://socket.io) — Real-time communication
- [MongoDB](https://mongodb.com) — Database
- [OpenAI](https://openai.com) — AI/GPT integration
- [Recharts](https://recharts.org) — Analytics charts
