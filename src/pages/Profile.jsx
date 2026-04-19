import React, { useState } from 'react';
import { Sun, Moon, Download, Trash2, Save, Shield, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, INCOME_CATEGORIES } from '../utils/constants';
import { formatCurrency, exportToCSV, getCurrentMonthTransactions } from '../utils/helpers';
import { ConfirmDialog } from '../components/ui';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function Profile() {
  const { user, darkMode, toggleDark, transactions, budgets, setBudget } = useApp();
  const [budgetInputs, setBudgetInputs] = useState(
    Object.fromEntries(Object.entries(budgets).map(([k, v]) => [k, String(v)]))
  );
  const [saved, setSaved] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);

  const expenseCategories = CATEGORIES.filter(c => !INCOME_CATEGORIES.includes(c.id));

  const thisMonth = getCurrentMonthTransactions(transactions);

  const handleSaveBudgets = () => {
    expenseCategories.forEach(cat => {
      const val = Number(budgetInputs[cat.id]);
      if (!isNaN(val) && val >= 0) setBudget(cat.id, val);
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Check which categories are over budget
  const overBudget = expenseCategories.filter(cat => {
    const limit = budgets[cat.id];
    if (!limit) return false;
    const spent = thisMonth
      .filter(t => t.type === 'expense' && t.category === cat.id)
      .reduce((s, t) => s + t.amount, 0);
    return spent > limit;
  });

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
      className="max-w-2xl space-y-5"
    >
      {/* Profile card */}
      <motion.div variants={fadeUp} className="card p-7 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-brand-500/25 flex-shrink-0">
          {user?.avatar || 'U'}
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">{user?.name}</h2>
          <p className="text-sm text-surface-500 dark:text-surface-400">{user?.email}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <Shield size={12} className="text-emerald-500" />
            <p className="text-xs text-surface-400 dark:text-surface-500 font-medium">
              {transactions.length} transactions tracked
            </p>
          </div>
        </div>
      </motion.div>

      {/* Budget alerts */}
      {overBudget.length > 0 && (
        <motion.div variants={fadeUp} className="card p-5 border-amber-200/60 dark:border-amber-500/20 bg-amber-50/60 dark:bg-amber-500/5 ">
          <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
            <span className="text-base">⚠️</span> Budget Alerts
          </h3>
          <div className="space-y-1.5">
            {overBudget.map(cat => {
              const spent = thisMonth
                .filter(t => t.type === 'expense' && t.category === cat.id)
                .reduce((s, t) => s + t.amount, 0);
              return (
                <p key={cat.id} className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                  {cat.icon} {cat.label}: spent {formatCurrency(spent)} / budget {formatCurrency(budgets[cat.id])}
                </p>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Preferences */}
      <motion.div variants={fadeUp} className="card p-6">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-5">Preferences</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              {darkMode ? <Moon size={15} className="text-brand-400" /> : <Sun size={15} className="text-amber-500" />}
              Dark mode
            </p>
            <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">Switch between light and dark themes</p>
          </div>
          <button
            onClick={toggleDark}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ${
              darkMode
                ? 'bg-gradient-to-r from-brand-500 to-brand-600 shadow-lg shadow-brand-500/30'
                : 'bg-surface-200 dark:bg-surface-700'
            }`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-all duration-300 ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </motion.div>

      {/* Monthly budgets */}
      <motion.div variants={fadeUp} className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Monthly Budgets</h2>
            <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">Set spending limits per category</p>
          </div>
          <button
            onClick={handleSaveBudgets}
            className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-300 ${
              saved
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20'
                : 'btn-primary'
            }`}
          >
            {saved ? <CheckCircle size={14} /> : <Save size={14} />}
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {expenseCategories.map((cat, i) => {
            const spent = thisMonth
              .filter(t => t.type === 'expense' && t.category === cat.id)
              .reduce((s, t) => s + t.amount, 0);
            const limit = budgets[cat.id];
            const pct = limit ? Math.min((spent / limit) * 100, 100) : 0;
            const over = limit && spent > limit;

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-surface-50/80 dark:bg-surface-800/40  rounded-xl p-4 border border-surface-100/60 dark:border-surface-700/30"
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-base">{cat.icon}</span>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex-1 truncate">{cat.label}</span>
                  {over && (
                    <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-full">
                      Over!
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-xs text-surface-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="No limit"
                    value={budgetInputs[cat.id] || ''}
                    onChange={e => setBudgetInputs(p => ({ ...p, [cat.id]: e.target.value }))}
                    className="flex-1 bg-white/80 dark:bg-surface-900/50  border border-surface-200/60 dark:border-surface-700/40 rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
                  />
                </div>
                {limit > 0 && (
                  <div>
                    <div className="h-1.5 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className={`h-full rounded-full ${over ? 'bg-red-500' : pct > 80 ? 'bg-amber-500' : 'bg-brand-500'}`}
                      />
                    </div>
                    <p className="text-[11px] text-surface-400 dark:text-surface-500 mt-1.5 font-medium">
                      {formatCurrency(spent)} / {formatCurrency(limit)}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Data management */}
      <motion.div variants={fadeUp} className="card p-6">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-5">Data Management</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Export transactions</p>
              <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">Download all your data as CSV</p>
            </div>
            <button
              onClick={() => exportToCSV(transactions)}
              className="flex items-center gap-2 text-sm btn-ghost border border-surface-200/60 dark:border-surface-700/40 px-5 py-2.5 rounded-xl font-medium"
            >
              <Download size={14} /> Export CSV
            </button>
          </div>

          <div className="border-t border-surface-100/80 dark:border-surface-800/40 pt-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">Clear all data</p>
              <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">Permanently delete all transactions</p>
            </div>
            <button
              onClick={() => setClearOpen(true)}
              className="flex items-center gap-2 text-sm text-red-500 border border-red-200/60 dark:border-red-500/20 px-5 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-all font-medium"
            >
              <Trash2 size={14} /> Clear
            </button>
          </div>
        </div>
      </motion.div>

      <ConfirmDialog
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        onConfirm={() => {
          localStorage.removeItem('et_transactions');
          window.location.reload();
        }}
        title="Clear all data"
        message="This will permanently delete all your transactions. This cannot be undone."
      />
    </motion.div>
  );
}
