const OpenAI = require('openai');

let openai;
const getOpenAI = () => {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
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
 * Get AI response from GPT-4
 */
const getChatResponse = async (messages, business, faqs = []) => {
  const client = getOpenAI();
  
  // Build conversation messages
  const systemPrompt = buildSystemPrompt(business, faqs);
  const conversationMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({ role: m.role, content: m.content })),
  ];

  try {
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
    if (error.code === 'insufficient_quota') {
      return {
        content: "I'm currently experiencing high demand. Please try again in a moment or contact us directly.",
        tokensUsed: 0,
      };
    }
    if (error.code === 'invalid_api_key') {
      return {
        content: "I'm having trouble connecting right now. Please contact us directly for assistance.",
        tokensUsed: 0,
      };
    }
    throw error;
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
