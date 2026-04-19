import React, { useEffect } from 'react';
import { X, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Modal ──────────────────────────────────────────────── */
export function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 "
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative w-full ${sizes[size]} bg-white/90 dark:bg-surface-900/90  rounded-2xl sm:rounded-3xl shadow-2xl border border-white/60 dark:border-surface-700/50`}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100/80 dark:border-surface-800/60">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ─── StatCard ───────────────────────────────────────────── */
export function StatCard({ label, value, sub, icon: Icon, color = 'brand', trend, trendValue }) {
  const colorMap = {
    brand:  { icon: 'bg-brand-100 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400', glow: 'hover:shadow-glow-brand' },
    green:  { icon: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400', glow: 'hover:shadow-glow-green' },
    red:    { icon: 'bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400', glow: 'hover:shadow-glow-red' },
    purple: { icon: 'bg-purple-100 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400', glow: 'hover:shadow-glow-purple' },
    amber:  { icon: 'bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400', glow: 'hover:shadow-glow-amber' },
  };
  const c = colorMap[color] || colorMap.brand;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`card p-5 ${c.glow} transition-all duration-300 group cursor-default`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${c.icon} group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={20} />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
            trend >= 0
              ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400'
          }`}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trendValue || trend).toFixed(1)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">{value}</p>
      <p className="text-sm font-medium text-surface-500 dark:text-surface-400 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">{sub}</p>}
    </motion.div>
  );
}

/* ─── CategoryBadge ──────────────────────────────────────── */
export function CategoryBadge({ category }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold "
      style={{
        backgroundColor: (category?.color || '#94a3b8') + '18',
        color: category?.color || '#94a3b8',
      }}
    >
      <span className="text-xs leading-none">{category?.icon}</span>
      {category?.label}
    </span>
  );
}

/* ─── EmptyState ─────────────────────────────────────────── */
export function EmptyState({ icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="text-6xl mb-5 animate-float">{icon}</div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1.5">{title}</h3>
      <p className="text-sm text-surface-500 dark:text-surface-400 mb-5 max-w-xs">{description}</p>
      {action}
    </motion.div>
  );
}

/* ─── InsightCard ────────────────────────────────────────── */
export function InsightCard({ type, title, text }) {
  const styles = {
    success: {
      bg: 'bg-emerald-50/80 dark:bg-emerald-500/10',
      border: 'border-emerald-200/60 dark:border-emerald-500/20',
      icon: '✅',
      text: 'text-emerald-800 dark:text-emerald-200',
      glow: 'shadow-emerald-100/50 dark:shadow-emerald-500/5',
    },
    warning: {
      bg: 'bg-amber-50/80 dark:bg-amber-500/10',
      border: 'border-amber-200/60 dark:border-amber-500/20',
      icon: '⚠️',
      text: 'text-amber-800 dark:text-amber-200',
      glow: 'shadow-amber-100/50 dark:shadow-amber-500/5',
    },
    info: {
      bg: 'bg-blue-50/80 dark:bg-blue-500/10',
      border: 'border-blue-200/60 dark:border-blue-500/20',
      icon: '💡',
      text: 'text-blue-800 dark:text-blue-200',
      glow: 'shadow-blue-100/50 dark:shadow-blue-500/5',
    },
  };
  const s = styles[type] || styles.info;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex gap-3 p-4 rounded-xl border  ${s.bg} ${s.border} shadow-sm ${s.glow} hover:shadow-md transition-shadow duration-200`}
    >
      <span className="text-base flex-shrink-0 mt-0.5">{s.icon}</span>
      <div>
        <p className={`text-xs font-bold mb-0.5 ${s.text}`}>{title}</p>
        <p className={`text-xs ${s.text} opacity-80 leading-relaxed`}>{text}</p>
      </div>
    </motion.div>
  );
}

/* ─── LoadingSpinner ─────────────────────────────────────── */
export function LoadingSpinner({ size = 20 }) {
  return (
    <svg
      width={size} height={size}
      className="animate-spin text-brand-600"
      viewBox="0 0 24 24" fill="none"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* ─── ConfirmDialog ──────────────────────────────────────── */
export function ConfirmDialog({ open, onClose, onConfirm, title, message }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex items-start gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/15 flex items-center justify-center flex-shrink-0">
          <AlertTriangle size={18} className="text-red-500" />
        </div>
        <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed pt-2">{message}</p>
      </div>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="btn-ghost text-sm px-5 py-2.5 border border-surface-200 dark:border-surface-700 rounded-xl">
          Cancel
        </button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-red-500/25 transition-all duration-200 hover:shadow-xl"
        >
          Delete
        </button>
      </div>
    </Modal>
  );
}
