import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES, INCOME_CATEGORIES } from '../../utils/constants';
import { format } from 'date-fns';

const EMPTY = { type: 'expense', amount: '', category: 'food', note: '', date: format(new Date(), 'yyyy-MM-dd') };

export default function TransactionModal({ onClose, editing }) {
  const { addTransaction, editTransaction } = useApp();
  const [form, setForm] = useState(editing ? {
    type: editing.type,
    amount: String(editing.amount),
    category: editing.category,
    note: editing.note || '',
    date: editing.date,
  } : EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const filteredCategories = CATEGORIES.filter(c =>
    form.type === 'income' ? INCOME_CATEGORIES.includes(c.id) : !INCOME_CATEGORIES.includes(c.id)
  );

  // Reset category if switching type
  useEffect(() => {
    if (form.type === 'income' && !INCOME_CATEGORIES.includes(form.category)) {
      setForm(f => ({ ...f, category: 'salary' }));
    } else if (form.type === 'expense' && INCOME_CATEGORIES.includes(form.category)) {
      setForm(f => ({ ...f, category: 'food' }));
    }
  }, [form.type]);

  const validate = () => {
    const e = {};
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) e.amount = 'Enter a valid amount';
    if (!form.date) e.date = 'Date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    const payload = { ...form, amount: Number(form.amount) };
    if (editing) {
      editTransaction({ ...payload, id: editing.id });
    } else {
      addTransaction(payload);
    }
    setLoading(false);
    onClose();
  };

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40  animate-fade-in">
      <div className="card w-full max-w-md p-6 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {editing ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type toggle */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            {['expense', 'income'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => set('type', t)}
                className={`flex-1 py-2.5 text-sm font-medium transition-all capitalize ${
                  form.type === t
                    ? t === 'expense'
                      ? 'bg-red-500 text-white'
                      : 'bg-emerald-500 text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div>
            <label className="label">Amount (₹)</label>
            <input
              type="number"
              className={`input ${errors.amount ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder="0"
              value={form.amount}
              onChange={e => set('amount', e.target.value)}
              min="0"
            />
            {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="label">Category</label>
            <select
              className="input"
              value={form.category}
              onChange={e => set('category', e.target.value)}
            >
              {filteredCategories.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="label">Date</label>
            <input
              type="date"
              className={`input ${errors.date ? 'border-red-400' : ''}`}
              value={form.date}
              max={format(new Date(), 'yyyy-MM-dd')}
              onChange={e => set('date', e.target.value)}
            />
            {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
          </div>

          {/* Note */}
          <div>
            <label className="label">Note (optional)</label>
            <input
              type="text"
              className="input"
              placeholder="Add a note..."
              value={form.note}
              onChange={e => set('note', e.target.value)}
              maxLength={80}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary py-2.5">
              {loading ? 'Saving...' : editing ? 'Update' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
