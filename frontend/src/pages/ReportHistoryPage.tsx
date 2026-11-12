import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Package, Trash2, Edit3, ExternalLink, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ConfirmModal } from '../components/ConfirmModal';
import { EmptyState } from '../components/EmptyState';

export const ReportHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [lostReports, setLostReports] = useState<any[]>([]);
  const [foundReports, setFoundReports] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'lost' | 'found' | 'active' | 'resolved' | 'withdrawn'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State for Withdrawal
  const [withdrawTarget, setWithdrawTarget] = useState<{ type: 'lost' | 'found'; id: number; name: string } | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const fetchHistory = async () => {
    try {
      const data = await api.getUserHistory();
      setLostReports(data.lost_reports || []);
      setFoundReports(data.found_reports || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleWithdrawConfirm = async () => {
    if (!withdrawTarget) return;
    setIsWithdrawing(true);
    try {
      if (withdrawTarget.type === 'lost') {
        await api.withdrawLostReport(withdrawTarget.id);
      } else {
        await api.withdrawFoundReport(withdrawTarget.id);
      }
      setWithdrawTarget(null);
      fetchHistory();
    } catch (err: any) {
      alert(err.message || 'Failed to withdraw report.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Combine and filter
  const allReports = [
    ...lostReports.map((r) => ({ ...r, _type: 'lost' })),
    ...foundReports.map((r) => ({ ...r, _type: 'found' }))
  ];

  const filteredReports = allReports.filter((r) => {
    if (activeTab === 'lost') return r._type === 'lost';
    if (activeTab === 'found') return r._type === 'found';
    if (activeTab === 'active') return r.status === 'active';
    if (activeTab === 'resolved') return r.status === 'resolved' || r.status === 'returned';
    if (activeTab === 'withdrawn') return r.status === 'withdrawn';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Title */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Report Lifecycle Tracker</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Your Report History
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Track, manage, and inspect all lost and found reports submitted from your verified account.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto space-x-4 sm:space-x-8 text-xs sm:text-sm font-bold">
        {(['all', 'lost', 'found', 'active', 'resolved', 'withdrawn'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 capitalize transition whitespace-nowrap ${
              activeTab === tab
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab === 'all' ? 'All Reports' : tab === 'resolved' ? 'Resolved / Returned' : tab}
          </button>
        ))}
      </div>

      {/* Report Table / List */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>Loading report records...</span>
        </div>
      ) : filteredReports.length === 0 ? (
        <EmptyState
          title={`No ${activeTab} Reports Recorded`}
          description="Reports filed from your student or staff account will be organized here."
          actionText="Report Lost Item"
          onAction={() => window.location.href = '/report/lost'}
          secondaryActionText="Report Found Item"
          onSecondaryAction={() => window.location.href = '/report/found'}
        />
      ) : (
        <div className="space-y-4">
          {filteredReports.map((item) => {
            const rawDate = item.lost_date || item.found_date;
            const formattedDate = rawDate
              ? new Date(rawDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : 'Recent';

            const detailLink = `/${item._type}-items/${item.report_id}`;

            return (
              <div
                key={`${item._type}-${item.id}`}
                className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        item._type === 'lost' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {item._type}
                    </span>
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-900/60">
                      {item.report_id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      item.status === 'active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' :
                      item.status === 'resolved' || item.status === 'returned' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' :
                      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-base truncate">
                    {item.item_name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <span>Category: <strong className="text-slate-700 dark:text-slate-200">{item.category}</strong></span>
                    <span>Location: <strong className="text-slate-700 dark:text-slate-200">{item.location}</strong></span>
                    <span>Date: {formattedDate}</span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center space-x-2 shrink-0">
                  <Link
                    to={detailLink}
                    className="px-4 py-2 bg-blue-50 hover:bg-blue-600 hover:text-white dark:bg-slate-800 dark:hover:bg-blue-600 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-xl transition flex items-center space-x-1"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  {item.status === 'active' && (
                    <button
                      onClick={() => setWithdrawTarget({ type: item._type, id: item.id, name: item.item_name })}
                      className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition"
                      title="Withdraw this report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Withdrawal */}
      {withdrawTarget && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setWithdrawTarget(null)}
          onConfirm={handleWithdrawConfirm}
          title="Withdraw Report"
          message={`Are you sure you want to withdraw "${withdrawTarget.name}"? It will be marked withdrawn and removed from active search results.`}
          confirmText="Withdraw Report"
          cancelText="Keep Active"
          variant="danger"
          isLoading={isWithdrawing}
        />
      )}

    </div>
  );
};
