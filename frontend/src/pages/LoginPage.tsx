import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, AlertCircle, Info, ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [regNumber, setRegNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(regNumber.trim().toUpperCase(), password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your registration number and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAccount = (reg: string, pass: string) => {
    setRegNumber(reg);
    setPassword(pass);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800/90 transition-colors">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 mx-auto flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Log In to Back<span className="text-blue-600 dark:text-blue-400">2</span>You
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            LPU Campus Community Lost & Found Network
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center space-x-2 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form with ONLY TWO MANDATORY FIELDS */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              University Registration Number
            </label>
            <input
              type="text"
              required
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value)}
              placeholder="e.g. 12001122 or EMP54321"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl text-xs sm:text-sm font-semibold focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none uppercase transition"
            />
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
              Student roll number or staff employee ID. Account type is identified automatically.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-11 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl text-xs sm:text-sm font-semibold focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs sm:text-sm shadow-xl shadow-blue-600/30 transition transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {isSubmitting ? 'Authenticating with Argon2id...' : 'Sign In to Campus Account'}
          </button>
        </form>

        {/* Demo Fast Fill Section */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs space-y-2">
          <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-300 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Quick Demo Credentials:</span>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => fillDemoAccount('12001122', 'Campus@2026!')}
              className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 rounded-lg text-slate-700 dark:text-slate-300 font-medium transition"
            >
              Student (Aarav)
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('12104567', 'Campus@2026!')}
              className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 rounded-lg text-slate-700 dark:text-slate-300 font-medium transition"
            >
              Student (Priya)
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('EMP54321', 'Campus@2026!')}
              className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 rounded-lg text-slate-700 dark:text-slate-300 font-medium transition"
            >
              Faculty (Dr. Raman)
            </button>
          </div>
        </div>

        {/* Forgot Password Section */}
        <div className="bg-blue-50/60 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-200/70 dark:border-blue-900/50 text-center space-y-1">
          <div className="flex items-center justify-center space-x-1.5 text-xs font-bold text-blue-950 dark:text-blue-300">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Forgot your password?</span>
          </div>
          <p className="text-[11px] text-blue-900 dark:text-blue-300/80 leading-relaxed">
            Please contact <span className="font-bold">LPU Student Services (Room 302, Block 32)</span> for in-person account verification and reset assistance.
          </p>
        </div>

        {/* Create Account link */}
        <div className="text-center pt-1 text-xs text-slate-500 dark:text-slate-400">
          <span>First time on Back2You? </span>
          <Link to="/register" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
            Create an account
          </Link>
        </div>

      </div>
    </div>
  );
};
