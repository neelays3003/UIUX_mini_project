import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES, INCOME_CATEGORIES } from '../../utils/constants';
import { Modal } from '../ui';
import { format } from 'date-fns';
import ReceiptScanner from './ReceiptScanner';

const today = format(new Date(), 'yyyy-MM-dd');

const EMPTY = { type: 'expense', amount: '', category: 'food', date: today, note: '' };

export default function TransactionForm({ open, onClose, editing = null }) {
  console.log("TransactionForm rendering... open=", open);
  const { addTransaction, editTransaction } = useApp();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  // eslint-disable-next-line no-unused-vars
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
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) {
      e.amount = 'Enter a valid amount';
    }
    if (!form.date) e.date = 'Date is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 300));

    const payload = { ...form, amount: Number(form.amount) };
    if (editing) editTransaction(payload);
    else addTransaction(payload);

    setLoading(false);
    onClose();
  };

  /* ─── Receipt Scanner Auto-fill ──────────────────────────── */
  const handleReceiptApply = useCallback((data) => {
    setForm(prev => ({
      ...prev,
      type: 'expense',
      amount: data.amount != null ? String(data.amount) : prev.amount,
      date: data.date || prev.date,
      category: data.category || prev.category,
      note: data.merchant || prev.note,
    }));
    setErrors({});
  }, []);

  const incomeCategories = CATEGORIES.filter(c => INCOME_CATEGORIES.includes(c.id));
  const expenseCategories = CATEGORIES.filter(c => !INCOME_CATEGORIES.includes(c.id));
  const visibleCategories = form.type === 'income' ? incomeCategories : expenseCategories;


  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit Transaction' : 'Add Transaction'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Receipt Scanner — only show when adding, not editing */}
        {!editing && (
          <ReceiptScanner onApply={handleReceiptApply} />
        )}

        {/* Type toggle */}
        <div>
          <label className="label">Type</label>
          <div className="flex gap-3">
            {['expense', 'income'].map(t => {
              const isSelected = form.type === t;
              const isExpense = t === 'expense';
              return (
                <button
                  type="button"
                  key={t}
                  onClick={() => {
                    set('type', t);
                    if (t === 'income' && !INCOME_CATEGORIES.includes(form.category)) set('category', 'salary');
                    if (t === 'expense' && INCOME_CATEGORIES.includes(form.category)) set('category', 'food');
                  }}
                  className={`flex-1 py-3 text-sm font-bold rounded-xl border-2 transition-all duration-200 ${
                    isSelected 
                      ? (isExpense 
                          ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400 shadow-sm' 
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-sm')
                      : 'bg-surface-50 dark:bg-surface-800/50 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-surface-300 dark:hover:border-surface-600'
                  }`}
                >
                  {t === 'income' ? '↑ Income' : '↓ Expense'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="label">Amount</label>
          <input
            type="number"
            value={form.amount}
            onChange={e => set('amount', e.target.value)}
            className="input"
          />
          {errors.amount && <p className="text-red-500 text-sm">{errors.amount}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="label">Category</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {visibleCategories.map(cat => {
              const isSelected = form.category === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => set('category', cat.id)}
                  className={`px-3 py-2.5 rounded-xl border transition-all duration-200 text-sm font-medium ${
                    isSelected 
                      ? 'bg-brand-500/10 border-brand-500/40 text-brand-700 dark:text-brand-400 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]'
                      : 'bg-surface-50 dark:bg-surface-800/30 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="label">Date</label>
          <input
            type="date"
            value={form.date}
            onChange={e => set('date', e.target.value)}
            className="input"
          />
          {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
        </div>

        {/* Note */}
        <div>
          <label className="label">Note</label>
          <input
            type="text"
            value={form.note}
            onChange={e => set('note', e.target.value)}
            className="input"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t border-surface-100 dark:border-surface-800/60 mt-6">
          <button type="button" onClick={onClose} className="btn-ghost px-5 py-2.5 rounded-xl">
            Cancel
          </button>
          <button type="submit" className="btn-primary min-w-[100px]">
            {loading ? 'Saving...' : (editing ? 'Save' : 'Add')}
          </button>
        </div>

      </form>
    </Modal>
  );
}