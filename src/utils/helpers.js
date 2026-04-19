import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO, subMonths } from 'date-fns';
import { INCOME_CATEGORIES, CATEGORY_MAP } from './constants';

/* ─── Formatting ─────────────────────────────────────────── */
export const formatCurrency = (amount, currency = '₹') =>
  `${currency}${Math.abs(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export const formatDate = (dateStr) => format(parseISO(dateStr), 'dd MMM yyyy');
export const formatShortDate = (dateStr) => format(parseISO(dateStr), 'dd MMM');
export const formatMonth = (dateStr) => format(parseISO(dateStr), 'MMM yyyy');

/* ─── Transaction helpers ────────────────────────────────── */
export const isIncome = (tx) => tx.type === 'income' || INCOME_CATEGORIES.includes(tx.category);

export const getTotal = (transactions, type) =>
  transactions.filter(t => t.type === type).reduce((sum, t) => sum + Number(t.amount), 0);

export const getBalance = (transactions) =>
  getTotal(transactions, 'income') - getTotal(transactions, 'expense');

export const filterByDateRange = (transactions, from, to) => {
  if (!from && !to) return transactions;
  return transactions.filter(t => {
    const date = parseISO(t.date);
    if (from && to) return isWithinInterval(date, { start: parseISO(from), end: parseISO(to) });
    if (from) return date >= parseISO(from);
    if (to) return date <= parseISO(to);
    return true;
  });
};

export const getCurrentMonthTransactions = (transactions) => {
  const now = new Date();
  return transactions.filter(t =>
    isWithinInterval(parseISO(t.date), {
      start: startOfMonth(now),
      end: endOfMonth(now),
    })
  );
};

/* ─── Chart data builders ────────────────────────────────── */
export const buildCategoryData = (transactions) => {
  const expenses = transactions.filter(t => t.type === 'expense');
  const map = {};
  expenses.forEach(t => {
    map[t.category] = (map[t.category] || 0) + Number(t.amount);
  });
  return Object.entries(map)
    .map(([id, value]) => ({
      id,
      name: CATEGORY_MAP[id]?.label || id,
      value,
      color: CATEGORY_MAP[id]?.color || '#94a3b8',
      icon: CATEGORY_MAP[id]?.icon || '💡',
    }))
    .sort((a, b) => b.value - a.value);
};

export const buildMonthlyData = (transactions, months = 6) => {
  const result = [];
  for (let i = months - 1; i >= 0; i--) {
    const ref = subMonths(new Date(), i);
    const start = startOfMonth(ref);
    const end = endOfMonth(ref);
    const slice = transactions.filter(t =>
      isWithinInterval(parseISO(t.date), { start, end })
    );
    result.push({
      month: format(ref, 'MMM'),
      income:  getTotal(slice, 'income'),
      expense: getTotal(slice, 'expense'),
    });
  }
  return result;
};

/* ─── AI Insights (rule-based) ───────────────────────────── */
export const generateInsights = (transactions) => {
  const insights = [];
  const now = new Date();
  const thisMonth = transactions.filter(t =>
    isWithinInterval(parseISO(t.date), { start: startOfMonth(now), end: endOfMonth(now) })
  );
  const lastMonth = transactions.filter(t =>
    isWithinInterval(parseISO(t.date), {
      start: startOfMonth(subMonths(now, 1)),
      end: endOfMonth(subMonths(now, 1)),
    })
  );

  const thisExpense  = getTotal(thisMonth, 'expense');
  const lastExpense  = getTotal(lastMonth, 'expense');
  const thisIncome   = getTotal(thisMonth, 'income');
  const savingsRate  = thisIncome > 0 ? ((thisIncome - thisExpense) / thisIncome) * 100 : 0;

  if (lastExpense > 0) {
    const diff = ((thisExpense - lastExpense) / lastExpense) * 100;
    if (diff > 10) {
      insights.push({ type: 'warning', title: 'Spending up', text: `You're spending ${Math.abs(diff).toFixed(0)}% more than last month. Review your budget.` });
    } else if (diff < -10) {
      insights.push({ type: 'success', title: 'Great savings!', text: `You spent ${Math.abs(diff).toFixed(0)}% less than last month. Keep it up!` });
    }
  }

  if (savingsRate > 30) {
    insights.push({ type: 'success', title: 'Strong saver', text: `You're saving ${savingsRate.toFixed(0)}% of your income this month. Excellent!` });
  } else if (savingsRate < 10 && thisIncome > 0) {
    insights.push({ type: 'warning', title: 'Low savings', text: `Only ${savingsRate.toFixed(0)}% savings rate this month. Consider trimming discretionary spend.` });
  }

  // Category-level insight
  const thisCategories = buildCategoryData(thisMonth);
  const lastCategories = buildCategoryData(lastMonth);
  thisCategories.slice(0, 3).forEach(cat => {
    const prev = lastCategories.find(c => c.id === cat.id);
    if (prev && prev.value > 0) {
      const catDiff = ((cat.value - prev.value) / prev.value) * 100;
      if (catDiff > 20) {
        insights.push({ type: 'info', title: cat.name, text: `${cat.name} spending rose ${catDiff.toFixed(0)}% vs last month.` });
      }
    }
  });

  // Top expense
  if (thisCategories.length > 0) {
    insights.push({ type: 'info', title: 'Top expense', text: `Your biggest spend this month is ${thisCategories[0].name} at ${formatCurrency(thisCategories[0].value)}.` });
  }

  return insights.slice(0, 4);
};

/* ─── CSV export ─────────────────────────────────────────── */
export const exportToCSV = (transactions) => {
  const headers = ['Date', 'Type', 'Category', 'Note', 'Amount'];
  const rows = transactions.map(t => [
    t.date,
    t.type,
    CATEGORY_MAP[t.category]?.label || t.category,
    `"${t.note || ''}"`,
    t.amount,
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'expenses.csv'; a.click();
  URL.revokeObjectURL(url);
};
