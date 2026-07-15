const OpenAI = require('openai');
const { classifyIntent } = require('./mlService');

let openai;
const getOpenAI = () => {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
};

/**
 * Smart local rule-based responder for fallback when OpenAI is unavailable
 */
const generateLocalResponse = (userMessage, business, faqs = []) => {
  const { businessName, businessInfo, chatbotConfig } = business;
  const { intent } = classifyIntent(userMessage);
  const lowerMsg = userMessage.toLowerCase();
  
  // 1. Search for a matching active FAQ (exact or keyword matching)
  let bestFaq = null;
  let maxMatches = 0;
  
  for (const faq of faqs) {
    if (!faq.isActive) continue;
    
    // Check keyword overlap
    const questionWords = faq.question.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    let matches = 0;
    for (const w of questionWords) {
      if (lowerMsg.includes(w)) matches++;
    }
    
    // Direct similarity
    if (lowerMsg.includes(faq.question.toLowerCase()) || faq.question.toLowerCase().includes(lowerMsg)) {
      matches += 5;
    }
    
    if (matches > maxMatches && matches >= 2) {
      maxMatches = matches;
      bestFaq = faq;
    }
  }

  if (bestFaq) {
    return bestFaq.answer;
  }

  // 2. Fall back to intent-based responses using businessInfo
  switch (intent) {
    case 'pricing':
      if (businessInfo?.pricing) {
        return `Regarding our pricing: ${businessInfo.pricing}. Let us know if you have specific questions!`;
      }
      return `For pricing details at ${businessName}, I recommend contacting us directly or checking our services.`;

    case 'hours':
      if (businessInfo?.openingHours) {
        return `${businessName} is open: ${businessInfo.openingHours}.`;
      }
      return `Please contact ${businessName} directly for our current opening hours.`;

    case 'location':
      if (businessInfo?.address) {
        return `You can find us at: ${businessInfo.address}.`;
      }
      return `${businessName}'s address is not listed. Please reach out to us directly for directions!`;

    case 'services':
      if (businessInfo?.services) {
        return `We offer the following services: ${businessInfo.services}.`;
      }
      return `To learn more about the services offered at ${businessName}, please contact us directly!`;

    case 'delivery':
      if (businessInfo?.deliveryOptions) {
        return `Our delivery options: ${businessInfo.deliveryOptions}.`;
      }
      return `Please contact ${businessName} directly to inquire about shipping and delivery options.`;

    case 'booking':
      return `To make a booking or appointment with ${businessName}, please reach out to us directly!`;

    case 'complaint':
      return `I'm very sorry to hear that you're having an issue. Let me share our contact info, or you can request to connect via WhatsApp so we can resolve this for you.`;

    case 'contact':
      const whatsappSuffix = chatbotConfig?.whatsappNumber ? ` You can also reach us on WhatsApp at ${chatbotConfig.whatsappNumber}.` : '';
      return `You can contact ${businessName} directly. We're here to help!${whatsappSuffix}`;

    case 'greeting':
      return chatbotConfig?.greeting || `Hi! How can I help you today? 😊`;

    case 'farewell':
      return `Goodbye! Let us know if you need anything else.`;

    default:
      // Try to find any FAQ matching the intent/category
      const categoryFaq = faqs.find(f => f.isActive && f.category === intent);
      if (categoryFaq) {
        return categoryFaq.answer;
      }
      
      // Default general response
      if (businessInfo?.services) {
        return `Welcome to ${businessName}! We provide: ${businessInfo.services}. How can I assist you today?`;
      }
      return `Hello! How can I assist you with ${businessName} today?`;
  }
};

/**
 * Build system prompt dynamically from business info and FAQs
 */
const buildSystemPrompt = (business, faqs = []) => {
  const { businessName, businessInfo, chatbotConfig } = business;
  const personality = chatbotConfig?.personality || 'friendly';
  
  const personalityGuide = {
    formal: 'You are professional, formal, and precise. Use polite language and avoid casual expressions.',
    friendly: 'You are warm, helpful, and conversational. Use a friendly tone with occasional emojis.',
    witty: 'You are clever, playful, and engaging. Light humor is welcome but stay professional.',
  };

  const faqBlock = faqs.length > 0
    ? `\n\n📋 BUSINESS FAQs (use these to answer questions accurately):\n${faqs.map((f, i) => `Q${i + 1}: ${f.question}\nA${i + 1}: ${f.answer}`).join('\n\n')}`
    : '';

  return `You are ${chatbotConfig?.botName || 'an AI assistant'} for ${businessName}.
${personalityGuide[personality]}

🏢 BUSINESS INFORMATION:
- Business Name: ${businessName}
- Type: ${business.businessType || 'General Business'}
- Opening Hours: ${businessInfo?.openingHours || 'Please contact us for hours'}
- Address: ${businessInfo?.address || 'Please contact us for our location'}
- Services: ${businessInfo?.services || 'Please contact us to learn about our services'}
- Pricing: ${businessInfo?.pricing || 'Please contact us for pricing information'}
- Delivery Options: ${businessInfo?.deliveryOptions || 'Please contact us for delivery information'}
- Special Offers: ${businessInfo?.specialOffers || 'Check with us for current offers'}
${faqBlock}

📌 INSTRUCTIONS:
1. Answer based on the business information above
2. Be concise and helpful (keep responses under 100 words unless detailed explanation needed)
3. If you don't know something, say "I'd recommend contacting us directly for that information"
4. If a user wants to speak to a human, acknowledge it warmly and let them know you'll connect them
5. Capture user name/email naturally when they seem like a lead
6. Never make up prices or information not provided above
7. Always respond in the same language the user writes in

Start every new conversation with: "${chatbotConfig?.greeting || 'Hi! How can I help you today? 😊'}"`;
};

/**
 * Get AI response from GPT-4 with a local rule-based fallback
 */
const getChatResponse = async (messages, business, faqs = []) => {
  const userMessage = messages[messages.length - 1]?.content || '';
  const apiKey = process.env.OPENAI_API_KEY;
  const isKeyInvalid = !apiKey || apiKey === 'sk-your-openai-api-key-here' || apiKey.trim() === '';

  if (isKeyInvalid) {
    console.log('⚠️ OpenAI API Key is missing or default. Using local rule-based responder.');
    return {
      content: generateLocalResponse(userMessage, business, faqs),
      tokensUsed: 0,
      isLocalFallback: true,
    };
  }

  try {
    const client = getOpenAI();
    const systemPrompt = buildSystemPrompt(business, faqs);
    const conversationMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ];

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini', // Cost-effective, fast model
      messages: conversationMessages,
      max_tokens: 300,
      temperature: 0.7,
      presence_penalty: 0.3,
    });

    return {
      content: response.choices[0].message.content,
      tokensUsed: response.usage?.total_tokens || 0,
    };
  } catch (error) {
    console.error('🔴 OpenAI API Error:', error.message);
    console.log('🔄 Falling back to local rule-based responder.');
    return {
      content: generateLocalResponse(userMessage, business, faqs),
      tokensUsed: 0,
      isLocalFallback: true,
    };
  }
};

/**
 * Auto-generate FAQs from business description
 */
const autoGenerateFAQs = async (businessInfo, businessName) => {
  const client = getOpenAI();
  
  const prompt = `Based on this business information for "${businessName}", generate 8 common customer FAQ question-answer pairs in JSON format.

Business Info:
${JSON.stringify(businessInfo, null, 2)}

Return ONLY valid JSON array like this:
[{"question": "...", "answer": "...", "category": "..."}]

Categories to use: pricing, hours, location, services, delivery, booking, general`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1000,
    temperature: 0.5,
  });

  try {
    const text = response.choices[0].message.content;
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error('FAQ generation parse error:', e);
  }
  return [];
};

module.exports = { getChatResponse, buildSystemPrompt, autoGenerateFAQs };
