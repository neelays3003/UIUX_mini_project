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

  const incomeCategories = CATEGORIES.filter(c => INCOME_CATEGORIES.includes(c.id));
  const expenseCategories = CATEGORIES.filter(c => !INCOME_CATEGORIES.includes(c.id));
  const visibleCategories = form.type === 'income' ? incomeCategories : expenseCategories;

  // ✅ FIXED useEffect (no ESLint error, no infinite loop)
  useEffect(() => {
    setForm(prev => {
      if (prev.type === 'income' && !INCOME_CATEGORIES.includes(prev.category)) {
        return { ...prev, category: 'salary' };
      }
      if (prev.type === 'expense' && INCOME_CATEGORIES.includes(prev.category)) {
        return { ...prev, category: 'food' };
      }
      return prev;
    });
  }, [form.type, form.category]);

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
                className={`flex-1 py-3 text-sm font-semibold rounded-xl border-2 ${
                  form.type === t ? 'bg-green-100 border-green-400' : 'border-gray-300'
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
          <div className="grid grid-cols-3 gap-2">
            {visibleCategories.map(cat => (
              <button
                type="button"
                key={cat.id}
                onClick={() => set('category', cat.id)}
                className={`p-2 border ${
                  form.category === cat.id ? 'border-blue-500' : 'border-gray-300'
                }`}
              >
                {cat.label}
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
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="btn">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            {editing ? 'Save' : 'Add'}
          </button>
        </div>

      </form>
    </Modal>
  );
}