# Finely — Smart Expense Tracker

A production-ready expense tracker built with React, Tailwind CSS, Recharts, Context API, and powered by AI Receipt Scanning.

## Features

- **Smart Receipt Scanner (NEW)** — Upload receipt images, extract text locally using Tesseract.js, and auto-categorize/fill data using Gemini via OpenRouter.
- **Premium Solid UI (NEW)** — A high-performance, polished OLED-inspired Neumorphic aesthetic for lag-free 60FPS rendering on all devices.
- **Dashboard** — Balance, income, expense stats + 6-month area chart + AI insights.
- **Transactions** — Add, edit, delete with search, filter by type/category/date, sort, CSV export.
- **Analytics** — Bar chart, pie chart, savings line chart, category breakdown.
- **Profile** — Per-category budget limits with alerts, dark mode, data export/clear.
- **Dark Mode** — Full dark theme, persisted to localStorage.
- **AI Insights** — Dynamic rule-based spending pattern analysis.
- **CSV Export** — One-click data export.

## Quick Start

### 1. Installation
```bash
git clone <repo>
cd expense-tracker
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
REACT_APP_NAME=Finely
REACT_APP_VERSION=1.0.0
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_OPENAI_API_KEY=your_openrouter_api_key_here
```

### 3. Run Application (Frontend + Proxy Server)
To run both the React frontend and the Express proxy server (required for AI Receipt Scanning):
```bash
npm run dev
```

Open http://localhost:3000 and click **"Try demo account"** to explore with pre-loaded data.

## Tech Stack

| Layer | Tech |
|-------|------|
| UI Framework | React 18 + Hooks |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| State | Context API + useReducer |
| Charts | Recharts |
| Icons | Lucide React |
| OCR Engine | Tesseract.js |
| AI API | OpenRouter (Gemini 2.0 Flash) |
| Proxy Server | Express / Node.js |

## Project Structure

```
expense-tracker/
├── server.js                 # Express proxy server for secure AI requests
├── src/
│   ├── context/
│   │   └── AppContext.jsx    # Global state
│   ├── utils/
│   │   ├── constants.js      # Categories, seed transactions
│   │   └── helpers.js        # Formatting, chart builders, insights
│   ├── services/
│   │   ├── ocrService.js     # Image preprocessing & Tesseract.js logic
│   │   ├── receiptAiService.js # LLM structuring logic
│   │   └── authService.js    # Mock JWT auth
│   ├── components/
│   │   ├── layout/           # AppLayout, Sidebar, Header
│   │   ├── ui/               # Shared UI components & Modals
│   │   └── transactions/     
│   │       ├── TransactionForm.jsx # Add/edit transaction form
│   │       └── ReceiptScanner.jsx  # Drag-and-drop scanner UI
│   └── pages/                # Dashboard, Analytics, Profile, etc.
```

## Security & Architecture

The AI Receipt Scanner utilizes a dual-layer architecture:
1. **Client-Side OCR**: Uses `Tesseract.js` to extract text from images locally. Images are never uploaded to a remote server.
2. **Backend Proxy (`server.js`)**: Extracted text is securely sent to the local proxy server, which forwards the request to the OpenRouter API. This ensures the API key (`REACT_APP_OPENAI_API_KEY`) is never exposed to the client.

## License

MIT
