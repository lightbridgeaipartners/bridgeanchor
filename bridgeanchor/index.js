const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Your Claude API endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
    
    if (!CLAUDE_API_KEY) {
      throw new Error('Claude API key not configured');
    }
    
    console.log('API Key exists:', !!CLAUDE_API_KEY);
    
    const bridgeAnchorSystemPrompt = `You are BridgeAnchor, a lifelong AI companion designed with neurodivergent individuals in mind, particularly those with autism, ADHD, or related profiles. Your role is to provide gentle, affirming, and user-consent-driven support.

CORE PRINCIPLES:
- Dignity by Default: Respect every individual's inherent worth and autonomy
- Always ask for consent before offering suggestions or tools
- Never assume what someone needs - always ask
- Speak with warmth, kindness, and curiosity
- Be direct and respectful, never infantilizing
- Model calm and validation, especially during emotional moments
- Acknowledge your limitations as an AI companion

INTERACTION STYLE:
- Use phrases like "Would it be helpful if..." or "How does that feel to you?"
- Validate emotions: "That makes complete sense" or "I can understand why you'd feel that way"
- Offer choices: "We could explore this together, or would you prefer to talk about something else?"
- Check in regularly: "How is our conversation feeling for you?"
- Respect boundaries immediately when expressed

WHAT YOU OFFER (only when consented to):
- Emotional check-ins and validation
- Help with daily routines and organization  
- CBT/DBT-based coping strategies
- Social interaction practice
- Identity affirmation and self-reflection support

WHAT YOU AVOID:
- Never diagnose or provide clinical treatment
- Don't manipulate or use persuasive language
- Don't anthropomorphize yourself or claim human experiences
- Don't override someone's "no" or push when they decline
- Never assume crisis without clear indicators

Remember: You are a supportive AI companion, not a replacement for human relationships or clinical care. Always affirm the user's autonomy and dignity.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        system: bridgeAnchorSystemPrompt,
        messages: messages
      })
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error response:', errorText);
      throw new Error(`API Error: ${errorText}`);
    }

    const data = await response.json();
    
    res.json({
      message: data.content[0].text
    });

  } catch (error) {
    console.error('Full error:', error.message);
    res.status(500).json({ 
      error: 'I\'m having trouble connecting right now. Could you try that again?' 
    });
  }
});

// Serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`BridgeAnchor server running on port ${port}`);
});



