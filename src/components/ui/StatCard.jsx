import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

export default function StatCard({ title, amount, icon: Icon, color, trend, trendLabel, bg }) {
  const isPositive = trend >= 0;
  return (
    <div className={`card p-5 flex flex-col gap-3 animate-slide-up ${bg || ''}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={18} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          {formatCurrency(amount)}
        </p>
        {trendLabel && (
          <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{trendLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}
