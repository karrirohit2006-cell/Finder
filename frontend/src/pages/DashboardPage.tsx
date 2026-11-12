import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  Search, 
  Camera, 
  RotateCcw, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Bell, 
  TrendingUp, 
  ArrowRight,
  ShieldCheck,
  Package,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>({
    total_lost_reports: 0,
    total_found_reports: 0,
    active_recovery_requests: 0,
    successfully_returned_items: 0,
    user_lost_reports: 0,
    user_found_reports: 0,
    user_active_recoveries: 0,
    unread_messages: 0,
    unread_notifications: 0
  });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [recoveryRequests, setRecoveryRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, notifs, reqs] = await Promise.all([
          api.getDashboardStats(),
          api.getNotifications(),
          api.getMyRecoveryRequests()
        ]);
        setStats(statsData);
        setNotifications(notifs.slice(0, 5));
        setRecoveryRequests(reqs.slice(0, 4));
      } catch (err) {
        console.error('Error fetching dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 text-white p-6 sm:p-10 border border-navy-700 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-500/40 text-blue-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="capitalize">{user.account_type} Account • LPU Portal</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, {user.full_name}!
            </h1>
            <p className="text-sm text-slate-300">
              {user.account_type === 'student' ? (
                <span>{user.branch} • {user.academic_year} • Reg. ID: {user.reg_number}</span>
              ) : (
                <span>{user.designation} • {user.department} • Emp. ID: {user.reg_number}</span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/report/lost"
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-md transition flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Lost</span>
            </Link>
            <Link
              to="/report/found"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Found</span>
            </Link>
            <Link
              to="/search/image"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition flex items-center space-x-1.5"
            >
              <Camera className="w-4 h-4" />
              <span>Search by Image</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Actual Live Database Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Total Lost Reports</span>
            <span className="text-2xl font-extrabold text-slate-900">{stats.total_lost_reports}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">({stats.user_lost_reports} by you)</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Total Found Reports</span>
            <span className="text-2xl font-extrabold text-slate-900">{stats.total_found_reports}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">({stats.user_found_reports} by you)</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Active Recoveries</span>
            <span className="text-2xl font-extrabold text-blue-600">{stats.active_recovery_requests}</span>
            <span className="text-[10px] text-blue-500 block mt-0.5">({stats.user_active_recoveries} involving you)</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Successfully Returned</span>
            <span className="text-2xl font-extrabold text-emerald-600">{stats.successfully_returned_items}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Verified Two-Party Handoffs</span>
          </div>
        </div>

      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Quick Actions & Recent Recovery Requests */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Action Cards */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Quick Portal Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              
              <Link
                to="/lost-items"
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 transition text-left group"
              >
                <Search className="w-5 h-5 text-blue-600 mb-2 group-hover:scale-110 transition transform" />
                <span className="block font-semibold text-xs text-slate-900">Browse Lost Items</span>
                <span className="text-[11px] text-slate-500">Search student belongings</span>
              </Link>

              <Link
                to="/found-items"
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 transition text-left group"
              >
                <Package className="w-5 h-5 text-emerald-600 mb-2 group-hover:scale-110 transition transform" />
                <span className="block font-semibold text-xs text-slate-900">Browse Found Items</span>
                <span className="text-[11px] text-slate-500">View photographed items</span>
              </Link>

              <Link
                to="/search/image"
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-purple-50/50 border border-slate-200 hover:border-purple-300 transition text-left group"
              >
                <Camera className="w-5 h-5 text-purple-600 mb-2 group-hover:scale-110 transition transform" />
                <span className="block font-semibold text-xs text-slate-900">Visual Similarity</span>
                <span className="text-[11px] text-slate-500">Find by image upload</span>
              </Link>

              <Link
                to="/recovery"
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 transition text-left group"
              >
                <RotateCcw className="w-5 h-5 text-blue-600 mb-2 group-hover:scale-110 transition transform" />
                <span className="block font-semibold text-xs text-slate-900">Recovery Requests</span>
                <span className="text-[11px] text-slate-500">Manage handoffs & approval</span>
              </Link>

              <Link
                to="/messages"
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 transition text-left group"
              >
                <MessageSquare className="w-5 h-5 text-indigo-600 mb-2 group-hover:scale-110 transition transform" />
                <span className="block font-semibold text-xs text-slate-900">Private Messaging</span>
                <span className="text-[11px] text-slate-500">Direct chat with finders</span>
              </Link>

              <Link
                to="/history"
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-amber-50/50 border border-slate-200 hover:border-amber-300 transition text-left group"
              >
                <Layers className="w-5 h-5 text-amber-600 mb-2 group-hover:scale-110 transition transform" />
                <span className="block font-semibold text-xs text-slate-900">Report History</span>
                <span className="text-[11px] text-slate-500">View or withdraw reports</span>
              </Link>

            </div>
          </div>

          {/* Active Recovery Requests */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Your Active Recovery Requests</h3>
              <Link to="/recovery" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
                View all ({recoveryRequests.length})
              </Link>
            </div>

            {recoveryRequests.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
                You have no active recovery requests at the moment.
              </div>
            ) : (
              <div className="space-y-3">
                {recoveryRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {req.request_code}
                        </span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          req.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                          req.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800">
                        {req.lost_report?.item_name || 'Lost Item'} ↔ {req.found_report?.item_name || 'Found Item'}
                      </p>
                    </div>

                    <Link
                      to={`/recovery/${req.request_code}`}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold rounded-lg transition"
                    >
                      Manage
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Notifications & Student Services */}
        <div className="space-y-6">
          
          {/* Notifications Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <span>Recent Notifications</span>
              </h3>
              {stats.unread_notifications > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                  {stats.unread_notifications} unread
                </span>
              )}
            </div>

            {notifications.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No notifications yet.</p>
            ) : (
              <div className="space-y-2.5">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <span className="font-semibold text-slate-800 block">{n.title}</span>
                    <p className="text-slate-600 line-clamp-2">{n.message}</p>
                    <span className="text-[10px] text-slate-400 block">
                      {new Date(n.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Student Services Information Card */}
          <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              LPU Student Services Helpline
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              For official in-person verification or custody handoff, visit Room 302, Block 32 (Division of Student Welfare).
            </p>
            <div className="text-xs text-slate-700 space-y-1 font-medium">
              <div>Phone: +91 1824 517000 / Ext. 3201</div>
              <div>Hours: Mon - Sat: 9:00 AM - 5:00 PM</div>
            </div>
            <Link
              to="/services"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-block pt-1"
            >
              Learn more about campus procedures →
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
};
