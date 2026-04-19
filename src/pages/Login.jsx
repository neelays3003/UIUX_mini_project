import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { authService } from '../services/authService';
import { motion } from 'framer-motion';

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [serverErr, setServerErr] = useState('');

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: '' }));
    setServerErr('');
  };

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const { user } = await authService.login(form.email, form.password);
      login(user);
      navigate('/dashboard');
    } catch (err) {
      setServerErr(err.message);
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async () => {
    setLoading(true);
    try {
      try { await authService.signup('Demo User', 'demo@finely.app', 'demo123'); } catch (_) {}
      const { user } = await authService.login('demo@finely.app', 'demo123');
      login(user);
      navigate('/dashboard');
    } catch (err) {
      setServerErr('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-purple-50 dark:from-surface-950 dark:via-surface-900 dark:to-surface-950" />
      <div className="absolute inset-0 bg-mesh-light dark:bg-mesh-dark" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-400/20 dark:bg-brand-400/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/15 dark:bg-purple-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
      <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl animate-pulse-soft" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-10">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center shadow-xl shadow-brand-500/30">
            <Wallet size={22} className="text-white" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Finely</span>
            <span className="flex items-center gap-1 text-xs text-brand-500 font-semibold mt-0.5">
              <Sparkles size={11} /> Smart Finance
            </span>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-surface-900/60  border border-white/60 dark:border-surface-700/50 rounded-3xl p-8 shadow-2xl">
          <div className="mb-7">
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1.5">Welcome back</h1>
            <p className="text-sm text-surface-500 dark:text-surface-400">Sign in to your account to continue</p>
          </div>

          {serverErr && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-4 bg-red-50/80 dark:bg-red-500/10 border border-red-200/60 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400 font-medium"
            >
              {serverErr}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                className={`input ${errors.email ? 'border-red-400 focus:ring-red-400/40' : ''}`}
                autoComplete="email"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.email}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  className={`input pr-11 ${errors.password ? 'border-red-400 focus:ring-red-400/40' : ''}`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors p-1"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              ) : <ArrowRight size={16} />}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-200/60 dark:border-surface-700/40" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white/70 dark:bg-surface-900/60 px-4 text-xs text-surface-400 font-medium">or</span>
            </div>
          </div>

          <button
            onClick={demoLogin}
            disabled={loading}
            className="w-full py-3 rounded-xl border border-surface-200/60 dark:border-surface-700/40 text-sm font-semibold text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-all duration-200 flex items-center justify-center gap-2 "
          >
            <Sparkles size={14} className="text-brand-500" />
            Try demo account
          </button>

          <p className="text-center text-sm text-surface-500 dark:text-surface-400 mt-7">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-600 dark:text-brand-400 font-bold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
