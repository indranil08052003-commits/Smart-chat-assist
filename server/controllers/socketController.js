const Chat = require('../models/Chat');
const Business = require('../models/Business');
const FAQ = require('../models/FAQ');
const Lead = require('../models/Lead');
const { getChatResponse } = require('../ml/openaiService');
const { classifyIntent, analyzeConversationSentiment, shouldHandoff } = require('../ml/mlService');

const socketHandler = (io) => {
  const activeSessions = new Map(); // sessionId -> { businessId, messages, startTime }

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Customer joins a chat session
    socket.on('join_chat', async ({ businessId, sessionId }) => {
      try {
        socket.join(sessionId);
        
        // Load or create chat session
        let chat = await Chat.findOne({ sessionId, businessId });
        if (!chat) {
          chat = await Chat.create({
            businessId,
            sessionId,
            messages: [],
            status: 'active',
          });
        }

        // Load business info
        const business = await Business.findById(businessId).select('-password');
        if (!business) {
          socket.emit('error', { message: 'Business not found' });
          return;
        }

        activeSessions.set(sessionId, {
          businessId,
          chatId: chat._id,
          messages: chat.messages || [],
          startTime: Date.now(),
          sensitiveCount: 0,
        });

      const session = activeSessions.get(sessionId);

        // Send greeting if new session
        // if (!chat.messages || chat.messages.length === 0) {
        //   const greeting = business.chatbotConfig?.greeting || 'Hi! How can I help you today? 😊';
        //   socket.emit('bot_message', {
        //     content: greeting,
        //     timestamp: new Date(),
        //     intent: 'greeting',
        //   });
        // } 
        if (!chat.messages || chat.messages.length === 0) {
            const greeting = business.chatbotConfig?.greeting || "Hi! How can I help you today? 😊";

            const greetingMsg = {
                role: "assistant",
                content: greeting,
                timestamp: new Date(),
                intent: "greeting",
            };

            chat.messages.push(greetingMsg);
            await chat.save();

            session.messages.push(greetingMsg);

            socket.emit("bot_message", greetingMsg);
            }else {
          // Restore existing messages
          socket.emit('chat_history', chat.messages);
        }

        // Send business config to widget
        socket.emit('business_config', {
          businessName: business.businessName,
          botName: business.chatbotConfig?.botName || 'Assistant',
          theme: business.chatbotConfig?.theme || '#6366f1',
          autoWhatsappHandoff: business.chatbotConfig?.autoWhatsappHandoff,
          whatsappNumber: business.chatbotConfig?.whatsappNumber,
        });

      } catch (error) {
        console.error('join_chat error:', error);
        socket.emit('error', { message: 'Failed to join chat session' });
      }
    });

    // Customer sends a message
    socket.on('send_message', async ({ sessionId, content, visitorName, visitorEmail }) => {
      const session = activeSessions.get(sessionId);
      if (!session) {
        socket.emit('error', { message: 'Session not found. Please refresh.' });
        return;
      }

      try {
        // Classify intent (ML)
        const { intent, confidence } = classifyIntent(content);
        
        // Add user message to session
        const userMsg = { role: 'user', content, timestamp: new Date(), intent, confidence };
        session.messages.push(userMsg);

        // Save to DB
        await Chat.findByIdAndUpdate(session.chatId, {
          $push: { messages: userMsg },
          $inc: { messageCount: 1 },
          ...(visitorName && { visitorName }),
          ...(visitorEmail && { visitorEmail }),
        });

        // Emit typing indicator
        socket.emit('bot_typing', true);

        // Check if handoff needed
        const business = await Business.findById(session.businessId);
        const faqs = await FAQ.find({ businessId: session.businessId, isActive: true });
        
        if (shouldHandoff(session.messages) && business.chatbotConfig?.autoWhatsappHandoff) {
          const whatsappNum = business.chatbotConfig?.whatsappNumber;
          socket.emit('handoff_trigger', {
            type: 'whatsapp',
            number: whatsappNum,
            message: 'Connecting you to our team on WhatsApp...',
          });
          
          await Chat.findByIdAndUpdate(session.chatId, {
            status: 'handed_off',
            handedOffTo: 'whatsapp',
          });
          return;
        }

        // Get GPT response
        const startTime = Date.now();
        const { content: botContent } = await getChatResponse(session.messages, business, faqs);
        const responseTime = Date.now() - startTime;

        // Analyze sentiment
        const sentiment = analyzeConversationSentiment(session.messages);

        // Add bot message
        const botMsg = { role: 'assistant', content: botContent, timestamp: new Date() };
        session.messages.push(botMsg);

        // Update DB
        await Chat.findByIdAndUpdate(session.chatId, {
          $push: { messages: botMsg },
          $inc: { messageCount: 1 },
          sentiment,
          avgResponseTime: responseTime,
        });

        // Update FAQ use count
        if (intent !== 'general' && intent !== 'greeting') {
          await FAQ.updateMany(
            { businessId: session.businessId, category: intent },
            { $inc: { useCount: 1 } }
          );
        }

        socket.emit('bot_typing', false);
        socket.emit('bot_message', {
          content: botContent,
          timestamp: new Date(),
          intent,
          confidence,
          responseTime,
        });

        // Auto lead capture
        if (visitorEmail || visitorName) {
          const existingLead = await Lead.findOne({ businessId: session.businessId, chatId: session.chatId });
          if (!existingLead) {
            await Lead.create({
              businessId: session.businessId,
              chatId: session.chatId,
              name: visitorName,
              email: visitorEmail,
            });
            await Chat.findByIdAndUpdate(session.chatId, { isLead: true });
          }
        }

      } catch (error) {
        console.error('send_message error:', error);
        socket.emit('bot_typing', false);
        socket.emit('bot_message', {
          content: "I'm having trouble responding right now. Please try again or contact us directly.",
          timestamp: new Date(),
          isError: true,
        });
      }
    });

    // Submit feedback
    socket.on('submit_feedback', async ({ sessionId, rating, comment }) => {
      const session = activeSessions.get(sessionId);
      if (!session) return;

      await Chat.findByIdAndUpdate(session.chatId, {
        feedback: { rating, comment, submittedAt: new Date() },
        status: 'closed',
        endedAt: new Date(),
        duration: Math.floor((Date.now() - session.startTime) / 1000),
      });

      socket.emit('feedback_received', { message: 'Thank you for your feedback! 🙏' });
    });

    // Disconnect
    socket.on('disconnect', async () => {
      // Find and close active sessions for this socket
      for (const [sessionId, session] of activeSessions.entries()) {
        const socketRooms = [...socket.rooms];
        if (socketRooms.includes(sessionId)) {
          const sentiment = analyzeConversationSentiment(session.messages);
          await Chat.findByIdAndUpdate(session.chatId, {
            status: 'closed',
            endedAt: new Date(),
            sentiment,
            duration: Math.floor((Date.now() - session.startTime) / 1000),
          });
          activeSessions.delete(sessionId);
        }
      }
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;
