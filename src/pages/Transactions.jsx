import React, { useState, useMemo } from 'react';
import { Search, Plus, Filter, Download, Pencil, Trash2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CategoryBadge, ConfirmDialog, EmptyState } from '../components/ui';
import TransactionForm from '../components/transactions/TransactionForm';
import { CATEGORIES, CATEGORY_MAP } from '../utils/constants';
import { formatCurrency, formatDate, exportToCSV, filterByDateRange } from '../utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';

export default function Transactions() {
  const { transactions, deleteTransaction } = useApp();
  const [formOpen, setFormOpen]   = useState(false);
  const [editing, setEditing]     = useState(null);
  const [deleteId, setDeleteId]   = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch]       = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');
  const [fromDate, setFromDate]   = useState('');
  const [toDate, setToDate]       = useState('');
  const [sortBy, setSortBy]       = useState('date-desc');

  const filtered = useMemo(() => {
    let list = [...transactions];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        (t.note || '').toLowerCase().includes(q) ||
        (CATEGORY_MAP[t.category]?.label || '').toLowerCase().includes(q)
      );
    }
    if (typeFilter !== 'all') list = list.filter(t => t.type === typeFilter);
    if (catFilter !== 'all')  list = list.filter(t => t.category === catFilter);
    list = filterByDateRange(list, fromDate, toDate);

    list.sort((a, b) => {
      if (sortBy === 'date-desc')   return new Date(b.date) - new Date(a.date);
      if (sortBy === 'date-asc')    return new Date(a.date) - new Date(b.date);
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc')  return a.amount - b.amount;
      return 0;
    });
    return list;
  }, [transactions, search, typeFilter, catFilter, fromDate, toDate, sortBy]);

  const clearFilters = () => {
    setSearch(''); setTypeFilter('all'); setCatFilter('all');
    setFromDate(''); setToDate('');
  };

  const hasFilters = search || typeFilter !== 'all' || catFilter !== 'all' || fromDate || toDate;

  const openEdit = (tx) => { setEditing(tx); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setEditing(null); };

  const netAmount = filtered.reduce((s, t) => t.type === 'income' ? s + t.amount : s - t.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Toolbar */}
      <div className="card p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Search transactions…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-10"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors p-1">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-ghost px-4 py-2.5 border flex items-center gap-2 text-sm font-medium rounded-xl transition-all ${
                hasFilters
                  ? 'border-brand-300 dark:border-brand-600 text-brand-600 dark:text-brand-400 bg-brand-50/80 dark:bg-brand-500/10'
                  : 'border-surface-200 dark:border-surface-700'
              }`}
            >
              <Filter size={14} />
              Filters{hasFilters ? ` (${[typeFilter !== 'all', catFilter !== 'all', !!fromDate, !!toDate].filter(Boolean).length})` : ''}
            </button>
            <button
              onClick={() => exportToCSV(filtered)}
              className="btn-ghost px-4 py-2.5 border border-surface-200 dark:border-surface-700 flex items-center gap-2 text-sm font-medium rounded-xl"
              title="Export to CSV"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={() => setFormOpen(true)}
              className="btn-primary px-5 py-2.5 flex items-center gap-2 text-sm"
            >
              <Plus size={14} /> Add
            </button>
          </div>
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-5 pt-5 border-t border-surface-100/80 dark:border-surface-800/40 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="label">Type</label>
                  <select className="input" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                    <option value="all">All types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div>
                  <label className="label">Category</label>
                  <select className="input" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                    <option value="all">All categories</option>
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">From</label>
                  <input type="date" className="input" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                </div>
                <div>
                  <label className="label">To</label>
                  <input type="date" className="input" value={toDate} onChange={e => setToDate(e.target.value)} />
                </div>
                <div className="col-span-2 sm:col-span-4 flex items-center justify-between pt-1">
                  <select className="input w-auto text-xs" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    <option value="date-desc">Newest first</option>
                    <option value="date-asc">Oldest first</option>
                    <option value="amount-desc">Highest amount</option>
                    <option value="amount-asc">Lowest amount</option>
                  </select>
                  {hasFilters && (
                    <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 font-semibold flex items-center gap-1 transition-colors">
                      <X size={12} /> Clear all
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-surface-500 dark:text-surface-400 font-medium">
          {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
          {hasFilters ? ' (filtered)' : ''}
        </p>
        <p className="text-xs text-surface-500 dark:text-surface-400">
          Net: <span className={`font-bold ${
            netAmount >= 0
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-red-500 dark:text-red-400'
          }`}>
            {netAmount >= 0 ? '+' : '-'}{formatCurrency(Math.abs(netAmount))}
          </span>
        </p>
      </div>

      {/* List */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={hasFilters ? '🔍' : '💸'}
            title={hasFilters ? 'No results' : 'No transactions yet'}
            description={hasFilters ? 'Try adjusting your filters' : 'Add your first income or expense to get started'}
            action={
              hasFilters
                ? <button onClick={clearFilters} className="btn-ghost border border-surface-200 dark:border-surface-700 text-sm px-5 py-2.5 rounded-xl font-medium">Clear filters</button>
                : <button onClick={() => setFormOpen(true)} className="btn-primary px-5 py-2.5 text-sm">Add transaction</button>
            }
          />
        ) : (
          <div className="divide-y divide-surface-100/60 dark:divide-surface-800/40">
            {filtered.map((tx, i) => {
              const cat = CATEGORY_MAP[tx.category];
              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  className="flex items-center gap-3 sm:gap-4 px-6 py-4 hover:bg-surface-50/80 dark:hover:bg-surface-800/30 transition-all duration-200 group"
                >
                  {/* Icon */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-lg group-hover:scale-110 transition-transform duration-200"
                    style={{ backgroundColor: (cat?.color || '#94a3b8') + '15' }}
                  >
                    {cat?.icon || '💡'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {tx.note || cat?.label}
                      </p>
                      <CategoryBadge category={cat} />
                    </div>
                    <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">{formatDate(tx.date)}</p>
                  </div>

                  {/* Amount */}
                  <span className={`text-sm font-extrabold flex-shrink-0 ${
                    tx.type === 'income'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-500 dark:text-red-400'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>

                  {/* Actions */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                    <button
                      onClick={() => openEdit(tx)}
                      className="p-2 rounded-xl text-surface-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all duration-200"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => setDeleteId(tx.id)}
                      className="p-2 rounded-xl text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <TransactionForm open={formOpen} onClose={closeForm} editing={editing} />
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteTransaction(deleteId)}
        title="Delete transaction"
        message="This transaction will be permanently deleted. Are you sure?"
      />
    </motion.div>
  );
}
