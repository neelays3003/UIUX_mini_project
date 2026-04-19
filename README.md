# Finely — Expense Tracker

A production-ready expense tracker built with React, Tailwind CSS, Recharts, and Context API.

## Features

- **Authentication** — Signup/login with mock JWT, demo account
- **Dashboard** — Balance, income, expense stats + 6-month area chart + AI insights
- **Transactions** — Add, edit, delete with search, filter by type/category/date, sort, CSV export
- **Analytics** — Bar chart, pie chart, savings line chart, category breakdown
- **Profile** — Per-category budget limits with alerts, dark mode, data export/clear
- **Dark mode** — Full dark theme, persisted to localStorage
- **AI Insights** — Rule-based spending pattern analysis
- **CSV Export** — One-click data export

## Quick Start

```bash
git clone <repo>
cd expense-tracker
npm install
cp .env.example .env
npm start
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
| Date utils | date-fns |
| IDs | uuid |

## Project Structure

```
src/
├── context/
│   └── AppContext.jsx        # Global state (auth, transactions, budgets, theme)
├── utils/
│   ├── constants.js          # Categories, seed transactions
│   └── helpers.js            # Formatting, chart builders, AI insights, CSV
├── services/
│   └── authService.js        # Mock JWT auth (swap for real API)
├── components/
│   ├── layout/
│   │   ├── AppLayout.jsx     # Main shell with sidebar + header
│   │   ├── Sidebar.jsx       # Navigation sidebar
│   │   └── Header.jsx        # Top bar with dark toggle
│   ├── ui/
│   │   └── index.jsx         # Shared: Modal, StatCard, CategoryBadge, InsightCard...
│   └── transactions/
│       └── TransactionForm.jsx  # Add/edit transaction modal
└── pages/
    ├── Login.jsx
    ├── Signup.jsx
    ├── Dashboard.jsx
    ├── Transactions.jsx
    ├── Analytics.jsx
    └── Profile.jsx
```

## Adding a Real Backend

Replace `src/services/authService.js` with real API calls:

```js
export const authService = {
  login: async (email, password) => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error((await res.json()).message);
    return res.json(); // { user, token }
  },
  // ...
};
```

## Environment Variables

See `.env.example` for all available variables.

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Dev server at localhost:3000 |
| `npm run build` | Production build |
| `npm test` | Run tests |

## License

MIT
