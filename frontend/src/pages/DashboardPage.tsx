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
  Layers,
  Sparkles,
  ChevronRight,
  Building,
  User,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ItemCard } from '../components/ItemCard';
import { StatsCardSkeleton, ItemCardSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';

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
  const [recentLost, setRecentLost] = useState<any[]>([]);
  const [recentFound, setRecentFound] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'lost' | 'found'>('lost');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, notifs, reqs, lost, found] = await Promise.all([
          api.getDashboardStats().catch(() => ({})),
          api.getNotifications().catch(() => []),
          api.getMyRecoveryRequests().catch(() => []),
          api.getLostReports({ limit: '3' }).catch(() => []),
          api.getFoundReports({ limit: '3' }).catch(() => [])
        ]);
        setStats(statsData || {});
        setNotifications((notifs || []).slice(0, 5));
        setRecoveryRequests((reqs || []).slice(0, 4));
        setRecentLost(lost || []);
        setRecentFound(found || []);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      
      {/* 1. WELCOME BANNER WITH USER SPECIFICATIONS */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 text-white p-6 sm:p-10 border border-navy-700/80 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-500/40 text-blue-300 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span className="capitalize">{user.account_type} Verified • Lovely Professional University</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Welcome back, {user.full_name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              {user.account_type === 'student' ? (
                <span>{user.branch} • {user.academic_year} • Reg. ID: <span className="font-mono text-blue-300 font-bold">{user.reg_number}</span></span>
              ) : (
                <span>{user.designation} • {user.department} • Emp. ID: <span className="font-mono text-blue-300 font-bold">{user.reg_number}</span></span>
              )}
            </p>
          </div>

          {/* Action Header Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/report/lost"
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition transform hover:-translate-y-0.5 flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Lost</span>
            </Link>
            <Link
              to="/report/found"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition transform hover:-translate-y-0.5 flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Found</span>
            </Link>
            <Link
              to="/search/image"
              className="px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-blue-300 font-bold text-xs border border-blue-500/40 shadow-md transition transform hover:-translate-y-0.5 flex items-center space-x-1.5"
            >
              <Camera className="w-4 h-4 text-blue-400" />
              <span>Search by Image</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. LIVE STATISTICS CARDS */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Card 1: Lost Items */}
          <Link
            to="/history"
            className="group bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-lg hover:border-rose-300 dark:hover:border-rose-900 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Lost Reports
              </span>
              <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {stats.total_lost_reports || 0}
              </span>
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                <span>{stats.user_lost_reports || 0} by your account</span>
                <span className="text-rose-600 dark:text-rose-400 font-semibold group-hover:underline">View →</span>
              </div>
            </div>
          </Link>

          {/* Card 2: Found Items */}
          <Link
            to="/found-items"
            className="group bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-900 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Found Reports
              </span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {stats.total_found_reports || 0}
              </span>
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                <span>{stats.user_found_reports || 0} catalogued by you</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold group-hover:underline">View →</span>
              </div>
            </div>
          </Link>

          {/* Card 3: Active Recoveries */}
          <Link
            to="/recovery"
            className="group bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-900 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Active Handshakes
              </span>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <RotateCcw className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-blue-600 dark:text-blue-400">
                {stats.active_recovery_requests || 0}
              </span>
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                <span>{stats.user_active_recoveries || 0} involving you</span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold group-hover:underline">Manage →</span>
              </div>
            </div>
          </Link>

          {/* Card 4: Returned */}
          <Link
            to="/feedback"
            className="group bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-lg hover:border-amber-300 dark:hover:border-amber-900 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Confirmed Returns
              </span>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {stats.successfully_returned_items || 0}
              </span>
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                <span>Two-Party Verified</span>
                <span className="text-amber-600 dark:text-amber-400 font-semibold group-hover:underline">Reviews →</span>
              </div>
            </div>
          </Link>

        </div>
      )}

      {/* 3. QUICK PORTAL ACTIONS TOOLBAR */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Quick Actions & Shortcuts</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          <Link
            to="/lost-items"
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50/80 dark:hover:bg-blue-950/30 border border-slate-200/80 dark:border-slate-700/60 hover:border-blue-400 transition text-left group"
          >
            <Search className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition transform" />
            <span className="block font-bold text-xs text-slate-900 dark:text-white">Lost Items</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Search campus feed</span>
          </Link>

          <Link
            to="/found-items"
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/30 border border-slate-200/80 dark:border-slate-700/60 hover:border-emerald-400 transition text-left group"
          >
            <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-2 group-hover:scale-110 transition transform" />
            <span className="block font-bold text-xs text-slate-900 dark:text-white">Found Items</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">View photographs</span>
          </Link>

          <Link
            to="/search/image"
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-purple-50/80 dark:hover:bg-purple-950/30 border border-slate-200/80 dark:border-slate-700/60 hover:border-purple-400 transition text-left group"
          >
            <Camera className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition transform" />
            <span className="block font-bold text-xs text-slate-900 dark:text-white">Visual Match</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Vector image search</span>
          </Link>

          <Link
            to="/recovery"
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50/80 dark:hover:bg-blue-950/30 border border-slate-200/80 dark:border-slate-700/60 hover:border-blue-400 transition text-left group"
          >
            <RotateCcw className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition transform" />
            <span className="block font-bold text-xs text-slate-900 dark:text-white">Recovery</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Handoff coordination</span>
          </Link>

          <Link
            to="/messages"
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/30 border border-slate-200/80 dark:border-slate-700/60 hover:border-indigo-400 transition text-left group relative"
          >
            {stats.unread_messages > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
            <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-2 group-hover:scale-110 transition transform" />
            <span className="block font-bold text-xs text-slate-900 dark:text-white">Messages</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {stats.unread_messages ? `${stats.unread_messages} unread` : 'Private student chat'}
            </span>
          </Link>

          <Link
            to="/history"
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-amber-50/80 dark:hover:bg-amber-950/30 border border-slate-200/80 dark:border-slate-700/60 hover:border-amber-400 transition text-left group"
          >
            <Layers className="w-5 h-5 text-amber-600 dark:text-amber-400 mb-2 group-hover:scale-110 transition transform" />
            <span className="block font-bold text-xs text-slate-900 dark:text-white">Report History</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Manage all reports</span>
          </Link>

        </div>
      </div>

      {/* 4. RECENTLY REPORTED BELONGINGS PREVIEW ON DASHBOARD */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Recently Reported on Campus
            </h3>
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
              <button
                onClick={() => setActiveTab('lost')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  activeTab === 'lost'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Lost Items
              </button>
              <button
                onClick={() => setActiveTab('found')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  activeTab === 'found'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Found Items
              </button>
            </div>
          </div>
          <Link
            to={activeTab === 'lost' ? '/lost-items' : '/found-items'}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
          >
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {activeTab === 'lost' ? (
          recentLost.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No recent lost items recorded.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentLost.map((item) => (
                <ItemCard key={item.id} item={item} type="lost" />
              ))}
            </div>
          )
        ) : (
          recentFound.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No recent found items recorded.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentFound.map((item) => (
                <ItemCard key={item.id} item={item} type="found" />
              ))}
            </div>
          )
        )}
      </div>

      {/* 5. SPLIT SECTION: ACTIVE RECOVERY HANDSHAKES & NOTIFICATIONS STREAM */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Active Recovery Handshakes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center space-x-2">
              <RotateCcw className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Your Active Recovery Handshakes</span>
            </h3>
            <Link to="/recovery" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
              View all ({recoveryRequests.length})
            </Link>
          </div>

          {recoveryRequests.length === 0 ? (
            <EmptyState
              title="No Active Recovery Handshakes"
              description="When you request an item or someone finds an item matching your report, recovery progress will appear here."
              actionText="Browse Found Items"
              onAction={() => window.location.href = '/found-items'}
            />
          ) : (
            <div className="space-y-3">
              {recoveryRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 hover:border-blue-400/60 shadow-sm transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 rounded-lg">
                        {req.request_code}
                      </span>
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        req.status === 'accepted' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        req.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                        req.status === 'rejected' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                        'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {req.lost_report?.item_name || 'Lost Item'} ↔ {req.found_report?.item_name || 'Found Item'}
                    </p>
                    <span className="text-[11px] text-slate-400 block">
                      Requested: {new Date(req.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <Link
                    to={`/recovery/${req.request_code}`}
                    className="px-4 py-2 bg-blue-50 hover:bg-blue-600 hover:text-white dark:bg-slate-800 dark:hover:bg-blue-600 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-xl transition text-center shrink-0"
                  >
                    Manage Handshake →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Recent Notifications & Student Welfare Helpline */}
        <div className="space-y-6">
          
          {/* Notifications Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center space-x-2">
                <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Recent Notifications</span>
              </h3>
              {stats.unread_notifications > 0 && (
                <span className="text-[10px] font-black px-2 py-0.5 bg-rose-500 text-white rounded-full">
                  {stats.unread_notifications} unread
                </span>
              )}
            </div>

            {notifications.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No recent notifications.</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 text-xs space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white block">{n.title}</span>
                    <p className="text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block pt-1">
                      {new Date(n.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Student Services Info Card */}
          <div className="bg-gradient-to-br from-slate-100 to-slate-200/80 dark:from-slate-900 dark:to-slate-800/80 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
              <Building className="w-4 h-4" />
              <span>LPU Student Services Helpline</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              For official in-person verification or high-value belonging custody, visit the Division of Student Welfare:
            </p>
            <div className="text-xs text-slate-700 dark:text-slate-200 space-y-1 font-semibold pt-1">
              <div>• Location: Room 302, Block 32</div>
              <div>• Phone: +91 1824 517000 / Ext. 3201</div>
              <div>• Working Hours: Mon – Sat (9:00 AM - 5:00 PM)</div>
            </div>
            <div className="pt-2">
              <Link
                to="/services"
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
              >
                <span>Full Student Services Guidelines</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
