import React, { useState, useMemo } from 'react';
import { Plus, ArrowUpRight, ArrowDownRight, Wallet, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatCard, InsightCard, EmptyState } from '../components/ui';
import TransactionForm from '../components/transactions/TransactionForm';
import {
  formatCurrency, formatShortDate, getTotal, getBalance,
  getCurrentMonthTransactions, buildCategoryData, generateInsights,
} from '../utils/helpers';
import { CATEGORY_MAP } from '../utils/constants';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, CartesianGrid,
} from 'recharts';
import { buildMonthlyData } from '../utils/helpers';
import { motion } from 'framer-motion';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function Dashboard() {
  const { transactions } = useApp();
  const [formOpen, setFormOpen] = useState(false);

  const thisMonth = useMemo(() => getCurrentMonthTransactions(transactions), [transactions]);
  const income   = useMemo(() => getTotal(thisMonth, 'income'),  [thisMonth]);
  const expenses = useMemo(() => getTotal(thisMonth, 'expense'), [thisMonth]);
  const balance  = useMemo(() => getBalance(transactions),        [transactions]);
  const insights = useMemo(() => generateInsights(transactions),  [transactions]);
  const monthly  = useMemo(() => buildMonthlyData(transactions, 6), [transactions]);
  const topCats  = useMemo(() => buildCategoryData(thisMonth).slice(0, 5), [thisMonth]);
  const recent   = useMemo(() => [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8), [transactions]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white/90 dark:bg-surface-900/90 backdrop-blur-xl border border-white/60 dark:border-surface-700/50 rounded-xl p-3 shadow-xl text-xs">
        <p className="font-bold text-gray-800 dark:text-gray-200 mb-2">{label}</p>
        {payload.map(p => (
          <p key={p.dataKey} style={{ color: p.color }} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
            {p.dataKey === 'income' ? 'Income' : 'Expense'}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Balance"   value={formatCurrency(balance)}  icon={Wallet}        color="brand" sub="All time" />
        <StatCard label="Monthly Income"  value={formatCurrency(income)}   icon={ArrowUpRight}  color="green" sub="This month" />
        <StatCard label="Monthly Expenses" value={formatCurrency(expenses)} icon={ArrowDownRight} color="red"  sub="This month" />
        <StatCard
          label="Savings Rate"
          value={income > 0 ? `${Math.round(((income - expenses) / income) * 100)}%` : '—'}
          icon={TrendingUp}
          color="purple"
          sub="This month"
        />
      </div>

      {/* Charts + Insights row */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area chart */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-5">6-Month Overview</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthly} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                tickFormatter={v => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="income"  stroke="#22c55e" strokeWidth={2.5} fill="url(#gIncome)"  dot={false} />
              <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2.5} fill="url(#gExpense)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-5 mt-3 justify-center">
            <span className="flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400 font-medium">
              <span className="w-3 h-1 bg-emerald-500 rounded-full inline-block" /> Income
            </span>
            <span className="flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400 font-medium">
              <span className="w-3 h-1 bg-red-500 rounded-full inline-block" /> Expenses
            </span>
          </div>
        </div>

        {/* AI Insights */}
        <div className="card p-6 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-lg">✨</span> AI Insights
          </h2>
          {insights.length === 0 ? (
            <p className="text-sm text-surface-400 dark:text-surface-500">Add more transactions to get insights.</p>
          ) : (
            insights.map((ins, i) => <InsightCard key={i} {...ins} />)
          )}
        </div>
      </motion.div>

      {/* Top categories + Recent transactions */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top categories */}
        <div className="card p-6">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-5">Top Expenses</h2>
          {topCats.length === 0 ? (
            <p className="text-sm text-surface-400">No expense data yet.</p>
          ) : (
            <div className="space-y-4">
              {topCats.map(cat => {
                const pct = expenses > 0 ? (cat.value / expenses) * 100 : 0;
                return (
                  <div key={cat.id} className="group">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <span className="text-sm">{cat.icon}</span>{cat.name}
                      </span>
                      <span className="text-xs font-bold text-surface-500 dark:text-surface-400">{formatCurrency(cat.value)}</span>
                    </div>
                    <div className="h-2 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent transactions */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Recent Transactions</h2>
            <button
              onClick={() => setFormOpen(true)}
              className="btn-primary px-4 py-2 text-xs flex items-center gap-2"
            >
              <Plus size={13} /> Add
            </button>
          </div>

          {recent.length === 0 ? (
            <EmptyState
              icon="💸"
              title="No transactions yet"
              description="Start by adding your first income or expense"
              action={
                <button onClick={() => setFormOpen(true)} className="btn-primary px-5 py-2.5 text-sm">
                  Add transaction
                </button>
              }
            />
          ) : (
            <div className="divide-y divide-surface-100/80 dark:divide-surface-800/40 -mx-6">
              {recent.map((tx, i) => {
                const cat = CATEGORY_MAP[tx.category];
                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 px-6 py-3.5 hover:bg-surface-50/80 dark:hover:bg-surface-800/30 transition-colors group"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-base group-hover:scale-110 transition-transform duration-200"
                      style={{ backgroundColor: (cat?.color || '#94a3b8') + '18' }}
                    >
                      {cat?.icon || '💡'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {tx.note || cat?.label}
                      </p>
                      <p className="text-xs text-surface-400 dark:text-surface-500">{formatShortDate(tx.date)}</p>
                    </div>
                    <span className={`text-sm font-bold flex-shrink-0 ${
                      tx.type === 'income'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-500 dark:text-red-400'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

      <TransactionForm open={formOpen} onClose={() => setFormOpen(false)} />
    </motion.div>
  );
}
