import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  Search, 
  Camera, 
  PlusCircle, 
  MessageSquare, 
  RotateCcw, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X, 
  HelpCircle,
  Clock,
  Layers,
  Sun,
  Moon,
  ChevronDown,
  LayoutDashboard,
  FileText,
  Settings,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { NotificationDropdown } from './NotificationDropdown';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-navy-950/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-navy-800/80 dark:border-slate-800/80 text-white shadow-xl transition-colors duration-200">
      
      {/* Top Academic Sub-banner */}
      <div className="bg-navy-900/90 dark:bg-slate-900/90 border-b border-navy-800/50 dark:border-slate-800/50 px-4 py-1 text-[11px] text-slate-300 flex justify-between items-center transition-colors">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium text-slate-200">Lovely Professional University</span>
          <span className="hidden sm:inline text-slate-400">• Independent Campus Lost & Found Community Network</span>
        </div>
        <div className="flex items-center space-x-3 text-slate-300 text-xs">
          <span className="hidden md:inline text-slate-400">Student Services: Block 32, Room 302</span>
          <span className="hidden md:inline text-slate-600">•</span>
          <Link to="/services" className="hover:text-blue-300 transition flex items-center space-x-1">
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            <span>Help & Contacts</span>
          </Link>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 group-hover:shadow-blue-500/30 transition transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tight text-white flex items-center gap-1.5">
                Back<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300">2</span>You
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-full bg-blue-900/90 text-blue-300 border border-blue-500/40">
                  LPU
                </span>
              </span>
              <span className="text-[10px] font-medium text-slate-400 -mt-1 hidden sm:inline tracking-wide">
                Campus Recovery Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1.5">
            <Link
              to="/lost-items"
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                isActive('/lost-items')
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-navy-900 dark:hover:bg-slate-900'
              }`}
            >
              Lost Items
            </Link>
            <Link
              to="/found-items"
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                isActive('/found-items')
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-navy-900 dark:hover:bg-slate-900'
              }`}
            >
              Found Items
            </Link>
            <Link
              to="/search/image"
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center space-x-1.5 ${
                isActive('/search/image')
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-blue-300 hover:text-white hover:bg-blue-900/40 border border-blue-500/30'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-blue-300" />
              <span>AI Image Search</span>
            </Link>
            <Link
              to="/feedback"
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                isActive('/feedback')
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-navy-900 dark:hover:bg-slate-900'
              }`}
            >
              Community Reviews
            </Link>
          </nav>

          {/* User Controls & Quick Action Buttons */}
          <div className="hidden sm:flex items-center space-x-3">
            
            {/* Dark / Light Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-navy-800 dark:hover:bg-slate-800 transition border border-transparent hover:border-slate-700"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 transition transform hover:rotate-90 duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-sky-300 transition transform hover:-rotate-45 duration-300" />
              )}
            </button>

            {isAuthenticated && user ? (
              <>
                {/* Fast Report Lost Button */}
                <Link
                  to="/report/lost"
                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-700/60 text-rose-200 transition shadow-sm flex items-center space-x-1.5 transform hover:-translate-y-0.5"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Report Lost</span>
                </Link>

                {/* Fast Report Found Button */}
                <Link
                  to="/report/found"
                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-200 transition shadow-sm flex items-center space-x-1.5 transform hover:-translate-y-0.5"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Report Found</span>
                </Link>

                <div className="h-6 w-px bg-navy-800 dark:bg-slate-800 mx-1"></div>

                {/* Recovery Requests Icon */}
                <Link
                  to="/recovery"
                  className={`p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-navy-800 dark:hover:bg-slate-800 transition ${
                    isActive('/recovery') ? 'bg-navy-800 text-blue-400 border border-blue-500/30' : ''
                  }`}
                  title="Recovery Requests Handshake"
                >
                  <RotateCcw className="w-4 h-4" />
                </Link>

                {/* Private Messages Icon */}
                <Link
                  to="/messages"
                  className={`p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-navy-800 dark:hover:bg-slate-800 transition relative ${
                    isActive('/messages') ? 'bg-navy-800 text-blue-400 border border-blue-500/30' : ''
                  }`}
                  title="Private Messages"
                >
                  <MessageSquare className="w-4 h-4" />
                </Link>

                {/* Notification Dropdown */}
                <NotificationDropdown />

                <div className="h-6 w-px bg-navy-800 dark:bg-slate-800 mx-1"></div>

                {/* User Profile Menu Dropdown */}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-2xl bg-navy-900 hover:bg-navy-800 dark:bg-slate-900 dark:hover:bg-slate-800 border border-navy-700/80 dark:border-slate-850 transition"
                  >
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center font-bold text-xs text-white uppercase shadow-sm">
                      {user.full_name ? user.full_name.charAt(0) : 'U'}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-slate-100 max-w-[95px] truncate leading-tight">
                        {user.full_name}
                      </span>
                      <span className="text-[10px] text-blue-300 uppercase tracking-wider font-semibold">
                        {user.account_type}
                      </span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown Box */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 text-slate-900 dark:text-white z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-1.5">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {user.full_name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          ID: {user.reg_number}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                          {user.account_type === 'student' ? `${user.branch} • ${user.academic_year}` : `${user.department}`}
                        </span>
                      </div>

                      <div className="space-y-0.5 text-xs font-semibold">
                        <Link
                          to="/dashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                          <LayoutDashboard className="w-4 h-4 text-blue-500" />
                          <span>Student Dashboard</span>
                        </Link>
                        <Link
                          to="/history"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                          <FileText className="w-4 h-4 text-emerald-500" />
                          <span>My Report History</span>
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                          <Settings className="w-4 h-4 text-slate-400" />
                          <span>Profile Settings</span>
                        </Link>
                      </div>

                      <div className="pt-1.5 mt-1.5 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold text-slate-200 hover:text-white hover:bg-navy-800 dark:hover:bg-slate-850 rounded-xl transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-600/30 transition transform hover:-translate-y-0.5"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Action Bar */}
          <div className="flex sm:hidden items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-navy-800"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-300" />}
            </button>
            {isAuthenticated && <NotificationDropdown />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-navy-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-navy-800 dark:border-slate-800 bg-navy-950 dark:bg-slate-950 px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/report/lost"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 text-center text-xs font-bold rounded-xl bg-rose-950/80 border border-rose-700/60 text-rose-200 shadow-sm"
            >
              Report Lost Item
            </Link>
            <Link
              to="/report/found"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 text-center text-xs font-bold rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-200 shadow-sm"
            >
              Report Found Item
            </Link>
          </div>

          <nav className="flex flex-col space-y-1 text-xs font-semibold text-slate-300">
            <Link
              to="/lost-items"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl hover:bg-navy-800 dark:hover:bg-slate-900"
            >
              Browse Lost Items
            </Link>
            <Link
              to="/found-items"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl hover:bg-navy-800 dark:hover:bg-slate-900"
            >
              Browse Found Items
            </Link>
            <Link
              to="/search/image"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl hover:bg-navy-800 dark:hover:bg-slate-900 text-blue-300 flex items-center space-x-2"
            >
              <Camera className="w-4 h-4 text-blue-400" />
              <span>AI Image-Based Search</span>
            </Link>
            <Link
              to="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl hover:bg-navy-800 dark:hover:bg-slate-900"
            >
              Student Services Information
            </Link>
            <Link
              to="/feedback"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl hover:bg-navy-800 dark:hover:bg-slate-900"
            >
              Community Reviews
            </Link>

            {isAuthenticated ? (
              <>
                <div className="pt-2 border-t border-navy-800 dark:border-slate-800"></div>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl hover:bg-navy-800 dark:hover:bg-slate-900 text-white font-bold flex items-center space-x-2"
                >
                  <LayoutDashboard className="w-4 h-4 text-blue-400" />
                  <span>My Dashboard</span>
                </Link>
                <Link
                  to="/recovery"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl hover:bg-navy-800 dark:hover:bg-slate-900"
                >
                  Recovery Requests
                </Link>
                <Link
                  to="/messages"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl hover:bg-navy-800 dark:hover:bg-slate-900"
                >
                  Private Messaging
                </Link>
                <Link
                  to="/history"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl hover:bg-navy-800 dark:hover:bg-slate-900"
                >
                  Report History
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl hover:bg-navy-800 dark:hover:bg-slate-900"
                >
                  Profile Settings
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-rose-400 hover:bg-navy-800 dark:hover:bg-slate-900 rounded-xl font-bold flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <div className="pt-3 border-t border-navy-800 dark:border-slate-800 flex flex-col space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-xs font-bold text-slate-200 bg-navy-900 dark:bg-slate-900 border border-navy-700 dark:border-slate-800 rounded-xl"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-xs font-bold text-white bg-blue-600 rounded-xl shadow-md"
                >
                  Create Account
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
