import React, { useState } from 'react';
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
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-navy-950 border-b border-navy-800 text-white shadow-lg">
      {/* Top Academic Sub-banner */}
      <div className="bg-navy-900 border-b border-navy-800/60 px-4 py-1 text-[11px] text-slate-300 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Lovely Professional University • Campus Lost & Found Community Network</span>
        </div>
        <div className="hidden sm:flex items-center space-x-4 text-slate-400">
          <span>Student Services: Block 32, Room 302</span>
          <span>•</span>
          <Link to="/services" className="hover:text-blue-300 transition">Help & Contacts</Link>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-sky-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                Back<span className="text-blue-400">2</span>You
                <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-blue-900/80 text-blue-300 border border-blue-700/50">
                  LPU
                </span>
              </span>
              <span className="text-[10px] text-slate-400 -mt-1 hidden sm:inline">
                Campus Recovery Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link
              to="/lost-items"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                isActive('/lost-items')
                  ? 'bg-navy-800 text-blue-400'
                  : 'text-slate-300 hover:text-white hover:bg-navy-900'
              }`}
            >
              Lost Items
            </Link>
            <Link
              to="/found-items"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                isActive('/found-items')
                  ? 'bg-navy-800 text-blue-400'
                  : 'text-slate-300 hover:text-white hover:bg-navy-900'
              }`}
            >
              Found Items
            </Link>
            <Link
              to="/search/image"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                isActive('/search/image')
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                  : 'text-blue-300 hover:bg-navy-900'
              }`}
            >
              <Camera className="w-4 h-4 text-blue-400" />
              <span>Image Search</span>
            </Link>
            <Link
              to="/services"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                isActive('/services')
                  ? 'bg-navy-800 text-blue-400'
                  : 'text-slate-300 hover:text-white hover:bg-navy-900'
              }`}
            >
              Student Services
            </Link>
          </nav>

          {/* User & Action Controls */}
          <div className="hidden sm:flex items-center space-x-3">
            {isAuthenticated && user ? (
              <>
                <Link
                  to="/report/lost"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-950/60 border border-red-700/60 text-red-200 hover:bg-red-900 transition flex items-center space-x-1"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-red-400" />
                  <span>Report Lost</span>
                </Link>
                <Link
                  to="/report/found"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-950/60 border border-emerald-700/60 text-emerald-200 hover:bg-emerald-900 transition flex items-center space-x-1"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Report Found</span>
                </Link>

                <div className="h-6 w-px bg-navy-800 mx-1"></div>

                <Link
                  to="/recovery"
                  className={`p-2 rounded-lg text-slate-300 hover:text-white hover:bg-navy-800 transition ${
                    isActive('/recovery') ? 'bg-navy-800 text-blue-400' : ''
                  }`}
                  title="Recovery Requests"
                >
                  <RotateCcw className="w-5 h-5" />
                </Link>

                <Link
                  to="/messages"
                  className={`p-2 rounded-lg text-slate-300 hover:text-white hover:bg-navy-800 transition relative ${
                    isActive('/messages') ? 'bg-navy-800 text-blue-400' : ''
                  }`}
                  title="Private Messages"
                >
                  <MessageSquare className="w-5 h-5" />
                </Link>

                <NotificationDropdown />

                <div className="h-6 w-px bg-navy-800 mx-1"></div>

                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 border border-navy-700/80 transition"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white uppercase">
                    {user.full_name.charAt(0)}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-100 max-w-[100px] truncate leading-tight">
                      {user.full_name}
                    </span>
                    <span className="text-[10px] text-blue-300 uppercase tracking-wider capitalize">
                      {user.account_type}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-navy-800 rounded-lg transition"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-200 hover:text-white hover:bg-navy-800 rounded-lg transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center space-x-2">
            {isAuthenticated && <NotificationDropdown />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-navy-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-navy-800 bg-navy-950 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-2 gap-2 pb-2">
            <Link
              to="/report/lost"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-center text-xs font-semibold rounded-lg bg-red-950/80 border border-red-700/60 text-red-200"
            >
              Report Lost Item
            </Link>
            <Link
              to="/report/found"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-center text-xs font-semibold rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-emerald-200"
            >
              Report Found Item
            </Link>
          </div>

          <nav className="flex flex-col space-y-1 text-sm font-medium text-slate-300">
            <Link
              to="/lost-items"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-navy-800"
            >
              Browse Lost Items
            </Link>
            <Link
              to="/found-items"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-navy-800"
            >
              Browse Found Items
            </Link>
            <Link
              to="/search/image"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-navy-800 text-blue-300 flex items-center space-x-2"
            >
              <Camera className="w-4 h-4 text-blue-400" />
              <span>Image-Based Search</span>
            </Link>
            <Link
              to="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-navy-800"
            >
              Student Services Info
            </Link>

            {isAuthenticated ? (
              <>
                <div className="pt-2 border-t border-navy-800"></div>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-navy-800 text-white font-semibold"
                >
                  My Dashboard
                </Link>
                <Link
                  to="/recovery"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-navy-800"
                >
                  Recovery Requests
                </Link>
                <Link
                  to="/messages"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-navy-800"
                >
                  Private Messaging
                </Link>
                <Link
                  to="/history"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-navy-800"
                >
                  Report History
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-navy-800"
                >
                  Profile Settings
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-red-400 hover:bg-navy-800 rounded-lg"
                >
                  Log Out
                </button>
              </>
            ) : (
              <div className="pt-3 border-t border-navy-800 flex flex-col space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 text-center text-sm font-medium text-slate-200 bg-navy-900 border border-navy-700 rounded-lg"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 text-center text-sm font-semibold text-white bg-blue-600 rounded-lg"
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
