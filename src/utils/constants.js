import { subDays, subMonths, format } from 'date-fns';

export const CATEGORIES = [
  { id: 'food',        label: 'Food & Dining',  icon: '🍔', color: '#f59e0b' },
  { id: 'transport',   label: 'Transport',       icon: '🚗', color: '#3b82f6' },
  { id: 'bills',       label: 'Bills & Utilities',icon: '⚡', color: '#ef4444' },
  { id: 'shopping',    label: 'Shopping',         icon: '🛍️', color: '#8b5cf6' },
  { id: 'health',      label: 'Health',           icon: '💊', color: '#10b981' },
  { id: 'entertainment',label: 'Entertainment',   icon: '🎮', color: '#ec4899' },
  { id: 'travel',      label: 'Travel',           icon: '✈️', color: '#06b6d4' },
  { id: 'education',   label: 'Education',        icon: '📚', color: '#84cc16' },
  { id: 'salary',      label: 'Salary',           icon: '💼', color: '#22c55e' },
  { id: 'freelance',   label: 'Freelance',        icon: '💻', color: '#6366f1' },
  { id: 'investment',  label: 'Investment',       icon: '📈', color: '#14b8a6' },
  { id: 'other',       label: 'Other',            icon: '💡', color: '#94a3b8' },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

export const INCOME_CATEGORIES = ['salary', 'freelance', 'investment'];
export const EXPENSE_CATEGORIES = CATEGORIES.filter(c => !INCOME_CATEGORIES.includes(c.id)).map(c => c.id);

/* ─── Sample seed data ───────────────────────────────────── */
const today = new Date();
const d = (n) => format(subDays(today, n), 'yyyy-MM-dd');
const m = (n) => format(subMonths(today, n), 'yyyy-MM-dd');

export const SAMPLE_TRANSACTIONS = [
  // Current month income
  { id: 's1', type: 'income',  amount: 85000, category: 'salary',        note: 'Monthly salary',          date: d(1)  },
  { id: 's2', type: 'income',  amount: 12000, category: 'freelance',      note: 'UI design project',       date: d(5)  },
  // Current month expenses
  { id: 's3', type: 'expense', amount: 4200,  category: 'food',           note: 'Groceries & restaurants', date: d(2)  },
  { id: 's4', type: 'expense', amount: 1500,  category: 'transport',      note: 'Cab rides',               date: d(3)  },
  { id: 's5', type: 'expense', amount: 8500,  category: 'bills',          note: 'Electricity & internet',  date: d(4)  },
  { id: 's6', type: 'expense', amount: 3200,  category: 'shopping',       note: 'Clothes & accessories',   date: d(6)  },
  { id: 's7', type: 'expense', amount: 2100,  category: 'entertainment',  note: 'OTT subscriptions',       date: d(8)  },
  { id: 's8', type: 'expense', amount: 1200,  category: 'health',         note: 'Pharmacy',                date: d(10) },
  { id: 's9', type: 'expense', amount: 900,   category: 'food',           note: 'Coffee & snacks',         date: d(12) },
  { id:'s10', type: 'expense', amount: 5500,  category: 'travel',         note: 'Weekend trip',            date: d(14) },
  // Last month
  { id:'s11', type: 'income',  amount: 85000, category: 'salary',         note: 'Monthly salary',          date: m(1)  },
  { id:'s12', type: 'expense', amount: 3800,  category: 'food',           note: 'Dining out',              date: m(1)  },
  { id:'s13', type: 'expense', amount: 2400,  category: 'shopping',       note: 'Electronics',             date: m(1)  },
  { id:'s14', type: 'expense', amount: 8500,  category: 'bills',          note: 'Monthly bills',           date: m(1)  },
  { id:'s15', type: 'expense', amount: 1800,  category: 'transport',      note: 'Fuel & cabs',             date: m(1)  },
  // 2 months ago
  { id:'s16', type: 'income',  amount: 85000, category: 'salary',         note: 'Monthly salary',          date: m(2)  },
  { id:'s17', type: 'income',  amount: 8000,  category: 'freelance',      note: 'Logo design',             date: m(2)  },
  { id:'s18', type: 'expense', amount: 15000, category: 'travel',         note: 'Goa trip',                date: m(2)  },
  { id:'s19', type: 'expense', amount: 4500,  category: 'food',           note: 'Restaurants',             date: m(2)  },
  { id:'s20', type: 'expense', amount: 3500,  category: 'education',      note: 'Online course',           date: m(2)  },
];
