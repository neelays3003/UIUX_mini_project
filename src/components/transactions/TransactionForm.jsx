import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES, INCOME_CATEGORIES } from '../../utils/constants';
import { Modal } from '../ui';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const today = format(new Date(), 'yyyy-MM-dd');

const EMPTY = { type: 'expense', amount: '', category: 'food', date: today, note: '' };

export default function TransactionForm({ open, onClose, editing = null }) {
  const { addTransaction, editTransaction } = useApp();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({ ...editing });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [editing, open]);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) e.amount = 'Enter a valid amount';
    if (!form.date) e.date = 'Date is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    await new Promise(r => setTimeout(r, 300)); // UX: tiny delay feels more real

    const payload = { ...form, amount: Number(form.amount) };
    if (editing) editTransaction(payload);
    else addTransaction(payload);

    setLoading(false);
    onClose();
  };

  const incomeCategories = CATEGORIES.filter(c => INCOME_CATEGORIES.includes(c.id));
  const expenseCategories = CATEGORIES.filter(c => !INCOME_CATEGORIES.includes(c.id));
  const visibleCategories = form.type === 'income' ? incomeCategories : expenseCategories;

  // Auto-switch category when type changes
  useEffect(() => {
    if (form.type === 'income' && !INCOME_CATEGORIES.includes(form.category)) {
      setForm(f => ({ ...f, category: 'salary' }));
    } else if (form.type === 'expense' && INCOME_CATEGORIES.includes(form.category)) {
      setForm(f => ({ ...f, category: 'food' }));
    }
  }, [form.type]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit Transaction' : 'Add Transaction'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Type toggle */}
        <div>
          <label className="label">Type</label>
          <div className="flex gap-2">
            {['expense', 'income'].map(t => (
              <button
                type="button"
                key={t}
                onClick={() => set('type', t)}
                className={`flex-1 py-3 text-sm font-semibold rounded-xl border-2 transition-all duration-200 ${
                  form.type === t
                    ? t === 'income'
                      ? 'bg-emerald-50/80 dark:bg-emerald-500/10 border-emerald-400 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 shadow-sm'
                      : 'bg-red-50/80 dark:bg-red-500/10 border-red-400 dark:border-red-500/40 text-red-700 dark:text-red-300 shadow-sm'
                    : 'border-surface-200 dark:border-surface-700 text-surface-500 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800'
                }`}
              >
                {t === 'income' ? '↑ Income' : '↓ Expense'}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="label">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 text-sm font-bold">₹</span>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={e => set('amount', e.target.value)}
              className={`input pl-8 text-lg font-bold ${errors.amount ? 'border-red-400 focus:ring-red-400/40' : ''}`}
            />
          </div>
          {errors.amount && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-red-500 mt-1.5 font-medium"
            >
              {errors.amount}
            </motion.p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="label">Category</label>
          <div className="grid grid-cols-3 gap-2">
            {visibleCategories.map(cat => (
              <button
                type="button"
                key={cat.id}
                onClick={() => set('category', cat.id)}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-xs transition-all duration-200 ${
                  form.category === cat.id
                    ? 'border-brand-400 dark:border-brand-500/50 bg-brand-50/80 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 shadow-sm scale-[1.02]'
                    : 'border-surface-200 dark:border-surface-700 text-surface-500 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 hover:border-surface-300 dark:hover:border-surface-600'
                }`}
              >
                <span className="text-xl leading-none">{cat.icon}</span>
                <span className="truncate w-full text-center leading-tight font-semibold">{cat.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="label">Date</label>
          <input
            type="date"
            value={form.date}
            max={today}
            onChange={e => set('date', e.target.value)}
            className={`input ${errors.date ? 'border-red-400 focus:ring-red-400/40' : ''}`}
          />
          {errors.date && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-red-500 mt-1.5 font-medium"
            >
              {errors.date}
            </motion.p>
          )}
        </div>

        {/* Note */}
        <div>
          <label className="label">Note <span className="normal-case text-surface-400">(optional)</span></label>
          <input
            type="text"
            placeholder="What was this for?"
            value={form.note}
            onChange={e => set('note', e.target.value)}
            className="input"
            maxLength={80}
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-surface-200/60 dark:border-surface-700/40 text-sm font-semibold text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            ) : null}
            {editing ? 'Save Changes' : 'Add Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
