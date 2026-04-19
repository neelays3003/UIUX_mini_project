/* ─── Express Proxy for OpenAI Receipt Extraction ─────────── */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000'] }));
app.use(express.json({ limit: '1mb' }));

// OpenRouter-compatible client (uses OpenAI SDK with custom base URL)
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:3000',
    'X-Title': 'Finely Expense Tracker',
  },
});

/* ─── POST /api/extract-receipt ───────────────────────────── */
app.post('/api/extract-receipt', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length < 5) {
      return res.status(400).json({
        error: 'No valid receipt text provided. The OCR may not have detected any text.',
      });
    }

    if (!process.env.REACT_APP_OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'API key is not configured. Please set REACT_APP_OPENAI_API_KEY in your .env file.',
      });
    }

    const completion = await openai.chat.completions.create({
      model: 'google/gemini-2.0-flash-001',
      temperature: 0,
      max_tokens: 300,
      messages: [
        {
          role: 'system',
          content:
            'You are a receipt data extraction assistant. You only return valid JSON. Never include explanations or markdown formatting.',
        },
        {
          role: 'user',
          content: `Extract the following fields from this receipt text:
- amount (number, total amount paid)
- date (string, in YYYY-MM-DD format)
- category (one of: Food, Travel, Shopping, Bills, Health, Entertainment, Education, Transport, Other)
- merchant (string, store or business name)

Receipt text:
"""
${text.slice(0, 3000)}
"""

Return ONLY valid JSON with these four keys. If a field cannot be determined, use null.`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim();

    // Parse JSON — handle potential markdown code fences
    let cleaned = raw;
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
    }

    const parsed = JSON.parse(cleaned);

    // Validate shape
    const result = {
      amount: typeof parsed.amount === 'number' ? parsed.amount : parseFloat(parsed.amount) || null,
      date: parsed.date || null,
      category: parsed.category || 'Other',
      merchant: parsed.merchant || null,
    };

    return res.json(result);
  } catch (err) {
    console.error('Receipt extraction error:', err.message);

    if (err instanceof SyntaxError) {
      return res.status(422).json({ error: 'AI returned invalid JSON. Please retry.' });
    }

    if (err.status === 401) {
      return res.status(401).json({ error: 'Invalid OpenAI API key.' });
    }

    if (err.status === 429) {
      return res.status(429).json({ error: 'OpenAI rate limit exceeded. Please wait and retry.' });
    }

    return res.status(500).json({ error: 'Failed to process receipt. Please try again.' });
  }
});

/* ─── Health Check ────────────────────────────────────────── */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasApiKey: !!process.env.REACT_APP_OPENAI_API_KEY });
});

/* ─── Start ───────────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`✅ Receipt API proxy running on http://localhost:${PORT}`);
  console.log(`   OpenAI key: ${process.env.REACT_APP_OPENAI_API_KEY ? '✓ configured' : '✗ missing'}`);
});
