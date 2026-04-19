import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts';
import { formatCurrency, buildCategoryData, buildMonthlyData, getTotal, getCurrentMonthTransactions } from '../utils/helpers';
import { InsightCard } from '../components/ui';
import { generateInsights } from '../utils/helpers';
import { motion } from 'framer-motion';

const MONTHS = [3, 6, 12];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function Analytics() {
  const { transactions } = useApp();
  const [monthRange, setMonthRange] = useState(6);

  const monthly    = useMemo(() => buildMonthlyData(transactions, monthRange), [transactions, monthRange]);
  const thisMonth  = useMemo(() => getCurrentMonthTransactions(transactions), [transactions]);
  const catData    = useMemo(() => buildCategoryData(thisMonth), [thisMonth]);
  const allCatData = useMemo(() => buildCategoryData(transactions), [transactions]);
  const insights   = useMemo(() => generateInsights(transactions), [transactions]);
  const income     = useMemo(() => getTotal(thisMonth, 'income'),  [thisMonth]);
  const expenses   = useMemo(() => getTotal(thisMonth, 'expense'), [thisMonth]);

  const GlassTooltip = ({ children }) => (
    <div className="bg-white/90 dark:bg-surface-900/90 backdrop-blur-xl border border-white/60 dark:border-surface-700/50 rounded-xl p-3 shadow-xl text-xs">
      {children}
    </div>
  );

  const PieTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0];
    return (
      <GlassTooltip>
        <p className="font-bold text-gray-800 dark:text-gray-200">{d.name}</p>
        <p style={{ color: d.payload.color }} className="font-semibold">{formatCurrency(d.value)}</p>
        <p className="text-surface-400">{((d.value / allCatData.reduce((s, c) => s + c.value, 0)) * 100).toFixed(1)}%</p>
      </GlassTooltip>
    );
  };

  const BarTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <GlassTooltip>
        <p className="font-bold mb-1.5 text-gray-800 dark:text-gray-200">{label}</p>
        {payload.map(p => (
          <p key={p.dataKey} style={{ color: p.fill }} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.fill }} />
            {p.dataKey === 'income' ? 'Income' : 'Expenses'}: {formatCurrency(p.value)}
          </p>
        ))}
      </GlassTooltip>
    );
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-5"
    >
      {/* Month range toggle */}
      <motion.div variants={fadeUp} className="flex items-center gap-2">
        <span className="text-xs text-surface-500 dark:text-surface-400 font-semibold">Show:</span>
        {MONTHS.map(m => (
          <button
            key={m}
            onClick={() => setMonthRange(m)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${
              monthRange === m
                ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/25'
                : 'bg-white/70 dark:bg-surface-900/50 backdrop-blur-sm border border-surface-200/60 dark:border-surface-700/40 text-surface-600 dark:text-surface-400 hover:border-brand-300 dark:hover:border-brand-600'
            }`}
          >
            {m}M
          </button>
        ))}
      </motion.div>

      {/* Row 1: Bar chart + Pie */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Bar chart */}
        <div className="card p-6 lg:col-span-3">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-5">Income vs Expenses</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthly} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                tickFormatter={v => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
              <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.05)', radius: 4 }} />
              <Bar dataKey="income"  fill="#22c55e" radius={[6, 6, 0, 0]} maxBarSize={36} />
              <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-5 justify-center mt-3">
            <span className="flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400 font-medium">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Income
            </span>
            <span className="flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400 font-medium">
              <span className="w-3 h-3 rounded bg-red-500 inline-block" /> Expenses
            </span>
          </div>
        </div>

        {/* Pie chart */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-5">
            Expense Breakdown <span className="text-xs text-surface-400 font-normal">(this month)</span>
          </h2>
          {catData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-surface-400 dark:text-surface-500 text-sm">
              No expense data yet
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={catData}
                    cx="50%" cy="50%"
                    innerRadius={52} outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {catData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {catData.slice(0, 5).map(cat => (
                  <div key={cat.id} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-surface-600 dark:text-surface-400 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: cat.color }} />
                      {cat.icon} {cat.name}
                    </span>
                    <span className="font-bold text-gray-700 dark:text-gray-300">{formatCurrency(cat.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Savings line chart */}
      <motion.div variants={fadeUp} className="card p-6">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-5">Monthly Savings</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={monthly.map(m => ({ ...m, savings: m.income - m.expense }))}
            margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
              tickFormatter={v => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
            <Tooltip
              formatter={(val) => [formatCurrency(val), 'Savings']}
              contentStyle={{ fontSize: 12, borderRadius: 12, border: 'none', backdropFilter: 'blur(12px)', background: 'rgba(255,255,255,0.9)' }}
            />
            <Line
              type="monotone" dataKey="savings"
              stroke="#6366f1" strokeWidth={2.5}
              dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Category breakdown table + AI insights */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Category table */}
        <div className="card p-6">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-5">All-time Category Breakdown</h2>
          {allCatData.length === 0 ? (
            <p className="text-sm text-surface-400">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {allCatData.map((cat, i) => {
                const total = allCatData.reduce((s, c) => s + c.value, 0);
                const pct = total > 0 ? (cat.value / total) * 100 : 0;
                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-base w-6 flex-shrink-0">{cat.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-700 dark:text-gray-300 font-semibold truncate">{cat.name}</span>
                        <span className="text-surface-500 dark:text-surface-400 ml-2 flex-shrink-0 font-bold">
                          {formatCurrency(cat.value)} · {pct.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 + i * 0.05 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* AI Insights */}
        <div className="card p-6">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
            <span className="text-lg">✨</span> AI Insights
          </h2>
          {insights.length === 0 ? (
            <p className="text-sm text-surface-400">Not enough data for insights yet.</p>
          ) : (
            <div className="space-y-3">
              {insights.map((ins, i) => <InsightCard key={i} {...ins} />)}
            </div>
          )}
          <div className="mt-6 pt-5 border-t border-surface-100/80 dark:border-surface-800/40">
            <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-4">This Month Summary</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Income',   value: formatCurrency(income),   color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50/80 dark:bg-emerald-500/10' },
                { label: 'Expenses', value: formatCurrency(expenses),  color: 'text-red-500 dark:text-red-400', bg: 'bg-red-50/80 dark:bg-red-500/10' },
                { label: 'Saved',    value: formatCurrency(income - expenses), color: income >= expenses ? 'text-brand-600 dark:text-brand-400' : 'text-red-500', bg: 'bg-brand-50/80 dark:bg-brand-500/10' },
              ].map(s => (
                <div key={s.label} className={`${s.bg} backdrop-blur-sm rounded-xl p-4 text-center border border-white/40 dark:border-surface-700/30`}>
                  <p className={`text-lg font-extrabold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-surface-500 dark:text-surface-400 mt-1 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
