import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertCircle, CheckCircle2, User, Briefcase, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const [accountType, setAccountType] = useState<'student' | 'staff'>('student');
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Student fields
  const [academicYear, setAcademicYear] = useState('1st Year');
  const [branch, setBranch] = useState('');

  // Staff fields
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Password rule checks
  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!hasMinLen || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      setError('Password does not fulfill all required security criteria.');
      return;
    }

    setIsSubmitting(true);

    const payload: any = {
      full_name: fullName.trim(),
      account_type: accountType,
      mobile_number: mobileNumber.trim(),
      reg_number: regNumber.trim().toUpperCase(),
      password,
      confirm_password: confirmPassword,
    };

    if (accountType === 'student') {
      payload.academic_year = academicYear;
      payload.branch = branch.trim();
    } else {
      payload.department = department.trim();
      payload.designation = designation.trim();
    }

    try {
      await register(payload);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-200">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-sky-500 mx-auto flex items-center justify-center text-white shadow-md">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Create Campus Account
          </h2>
          <p className="text-xs text-slate-500">
            Join the Lovely Professional University Lost & Found network
          </p>
        </div>

        {/* Account Type Selector */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setAccountType('student')}
            className={`py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition ${
              accountType === 'student'
                ? 'bg-white text-blue-700 shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Account</span>
          </button>

          <button
            type="button"
            onClick={() => setAccountType('staff')}
            className={`py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition ${
              accountType === 'staff'
                ? 'bg-white text-blue-700 shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Staff / Faculty Account</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Common Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Aarav Sharma"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Kept private until recovery request accepted</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              University Registration Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value)}
              placeholder={accountType === 'student' ? 'e.g. 12001122 (Roll Number)' : 'e.g. EMP54321 (Employee ID)'}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium uppercase focus:bg-white focus:border-blue-500 outline-none"
            />
          </div>

          {/* Conditional Student Fields */}
          {accountType === 'student' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
              <div>
                <label className="block text-xs font-semibold text-blue-900 mb-1">
                  Academic Year <span className="text-red-500">*</span>
                </label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-blue-200 rounded-xl text-sm focus:border-blue-500 outline-none"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Post-Graduate">Post-Graduate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-blue-900 mb-1">
                  Branch / Program <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g. B.Tech Computer Science"
                  className="w-full px-3.5 py-2.5 bg-white border border-blue-200 rounded-xl text-sm focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* Conditional Staff Fields */}
          {accountType === 'staff' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-100/70 rounded-2xl border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1">
                  Department / School <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. School of Computer Science"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1">
                  Designation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Assistant Professor, Warden"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* Password Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Password Rules Checklist */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] space-y-1 text-slate-600">
            <span className="font-semibold block text-slate-700">Password Security Requirements:</span>
            <div className="grid grid-cols-2 gap-1">
              <span className={hasMinLen ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
                {hasMinLen ? '✓' : '○'} Min 8 characters
              </span>
              <span className={hasUpper ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
                {hasUpper ? '✓' : '○'} Uppercase letter
              </span>
              <span className={hasLower ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
                {hasLower ? '✓' : '○'} Lowercase letter
              </span>
              <span className={hasNumber ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
                {hasNumber ? '✓' : '○'} Number (0-9)
              </span>
              <span className={hasSpecial ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
                {hasSpecial ? '✓' : '○'} Special character (!@#$)
              </span>
              <span className={passwordsMatch ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
                {passwordsMatch ? '✓' : '○'} Passwords match
              </span>
            </div>
          </div>

          {/* Platform Limitation Notice */}
          <div className="text-[11px] text-slate-500 bg-amber-50/70 border border-amber-200/80 p-3 rounded-xl leading-relaxed">
            <span className="font-semibold text-amber-900">Notice:</span> Registration number ownership is not independently verified by Back2You. Please ensure accurate registration details to avoid recovery disputes.
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-600/30 transition transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-600">
          <span>Already have an account? </span>
          <Link to="/login" className="font-bold text-blue-600 hover:text-blue-800">
            Sign in
          </Link>
        </div>

      </div>
    </div>
  );
};
