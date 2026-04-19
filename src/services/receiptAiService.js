/* ─── Receipt AI Service — OpenAI Extraction via Express Proxy ─ */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Map AI-returned category names to existing app category IDs.
 */
const CATEGORY_MAP = {
  food:          'food',
  'food & dining': 'food',
  dining:        'food',
  restaurant:    'food',
  groceries:     'food',
  travel:        'travel',
  transport:     'transport',
  transportation:'transport',
  cab:           'transport',
  uber:          'transport',
  shopping:      'shopping',
  bills:         'bills',
  utilities:     'bills',
  'bills & utilities': 'bills',
  health:        'health',
  medical:       'health',
  pharmacy:      'health',
  entertainment: 'entertainment',
  education:     'education',
  other:         'other',
};

/**
 * Map an AI-returned category string to an app category ID.
 * @param {string} aiCategory
 * @returns {string} — App category ID
 */
export function mapCategoryToApp(aiCategory) {
  if (!aiCategory) return 'other';
  const key = aiCategory.toLowerCase().trim();
  return CATEGORY_MAP[key] || 'other';
}

/**
 * Send OCR text to the Express proxy and get structured receipt data.
 * @param {string} ocrText — Raw text from Tesseract
 * @returns {Promise<{amount: number|null, date: string|null, category: string, merchant: string|null}>}
 */
export async function extractReceiptData(ocrText) {
  const response = await fetch(`${API_URL}/extract-receipt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: ocrText }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Server error (${response.status})`);
  }

  const data = await response.json();

  // Normalize
  return {
    amount: data.amount != null ? Number(data.amount) : null,
    date: data.date || null,
    category: mapCategoryToApp(data.category),
    merchant: data.merchant || null,
  };
}
