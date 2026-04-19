import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { SAMPLE_TRANSACTIONS } from '../utils/constants';

/* ─── Initial State ─────────────────────────────────────── */
const initialState = {
  // Auth
  user: JSON.parse(localStorage.getItem('et_user') || 'null'),
  isAuthenticated: !!localStorage.getItem('et_user'),

  // Transactions
  transactions: JSON.parse(localStorage.getItem('et_transactions') || 'null') || SAMPLE_TRANSACTIONS,

  // UI
  darkMode: localStorage.getItem('et_dark') === 'true',
  sidebarOpen: false,

  // Budget limits per category (monthly)
  budgets: JSON.parse(localStorage.getItem('et_budgets') || '{}'),
};

/* ─── Reducer ───────────────────────────────────────────── */
function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      localStorage.setItem('et_user', JSON.stringify(action.payload));
      return { ...state, user: action.payload, isAuthenticated: true };

    case 'LOGOUT':
      localStorage.removeItem('et_user');
      return { ...state, user: null, isAuthenticated: false };

    case 'ADD_TRANSACTION': {
      const tx = { ...action.payload, id: uuidv4(), createdAt: new Date().toISOString() };
      const updated = [tx, ...state.transactions];
      localStorage.setItem('et_transactions', JSON.stringify(updated));
      return { ...state, transactions: updated };
    }

    case 'EDIT_TRANSACTION': {
      const updated = state.transactions.map(t =>
        t.id === action.payload.id ? { ...t, ...action.payload } : t
      );
      localStorage.setItem('et_transactions', JSON.stringify(updated));
      return { ...state, transactions: updated };
    }

    case 'DELETE_TRANSACTION': {
      const updated = state.transactions.filter(t => t.id !== action.payload);
      localStorage.setItem('et_transactions', JSON.stringify(updated));
      return { ...state, transactions: updated };
    }

    case 'TOGGLE_DARK': {
      const next = !state.darkMode;
      localStorage.setItem('et_dark', String(next));
      if (next) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      return { ...state, darkMode: next };
    }

    case 'SET_SIDEBAR':
      return { ...state, sidebarOpen: action.payload };

    case 'SET_BUDGET': {
      const budgets = { ...state.budgets, [action.payload.category]: action.payload.amount };
      localStorage.setItem('et_budgets', JSON.stringify(budgets));
      return { ...state, budgets };
    }

    default:
      return state;
  }
}

/* ─── Context ───────────────────────────────────────────── */
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Apply dark mode on mount
  useEffect(() => {
    if (state.darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [state.darkMode]);

  const login = useCallback((userData) => dispatch({ type: 'LOGIN', payload: userData }), []);
  const logout = useCallback(() => dispatch({ type: 'LOGOUT' }), []);
  const addTransaction = useCallback((tx) => dispatch({ type: 'ADD_TRANSACTION', payload: tx }), []);
  const editTransaction = useCallback((tx) => dispatch({ type: 'EDIT_TRANSACTION', payload: tx }), []);
  const deleteTransaction = useCallback((id) => dispatch({ type: 'DELETE_TRANSACTION', payload: id }), []);
  const toggleDark = useCallback(() => dispatch({ type: 'TOGGLE_DARK' }), []);
  const setSidebarOpen = useCallback((v) => dispatch({ type: 'SET_SIDEBAR', payload: v }), []);
  const setBudget = useCallback((category, amount) => dispatch({ type: 'SET_BUDGET', payload: { category, amount } }), []);

  return (
    <AppContext.Provider value={{
      ...state,
      login, logout,
      addTransaction, editTransaction, deleteTransaction,
      toggleDark, setSidebarOpen, setBudget,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
