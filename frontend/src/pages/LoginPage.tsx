import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, AlertCircle, Info, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [regNumber, setRegNumber] = useState('');
  const [password, setPassword] = useState('');
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
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-200">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-sky-500 mx-auto flex items-center justify-center text-white shadow-md">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Log In to Back<span className="text-blue-600">2</span>You
          </h2>
          <p className="text-xs text-slate-500">
            LPU Campus Community Lost & Found Network
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form with ONLY TWO FIELDS */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              University Registration Number
            </label>
            <input
              type="text"
              required
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value)}
              placeholder="e.g. 12001122 or EMP54321"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none uppercase transition"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Enter your student roll number or employee staff ID. Account type is identified automatically.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-600/30 transition transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Forgot Password Section */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-1.5">
          <div className="flex items-center justify-center space-x-1.5 text-xs font-semibold text-slate-700">
            <Info className="w-4 h-4 text-blue-600" />
            <span>Forgot your password?</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Please contact <span className="font-semibold text-slate-700">LPU Student Services (Room 302, Block 32)</span> for in-person account verification and reset assistance.
          </p>
        </div>

        {/* Create Account link */}
        <div className="text-center pt-2 text-xs text-slate-600">
          <span>First time on Back2You? </span>
          <Link to="/register" className="font-bold text-blue-600 hover:text-blue-800">
            Create an account
          </Link>
        </div>

      </div>
    </div>
  );
};
