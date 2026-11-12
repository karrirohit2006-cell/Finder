import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Package, Trash2, Edit3, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ReportHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [lostReports, setLostReports] = useState<any[]>([]);
  const [foundReports, setFoundReports] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'lost' | 'found' | 'active' | 'resolved' | 'withdrawn'>('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const data = await api.getUserHistory();
      setLostReports(data.lost_reports);
      setFoundReports(data.found_reports);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleWithdraw = async (type: 'lost' | 'found', id: number) => {
    if (!window.confirm('Withdraw this report? It will no longer appear in active search listings.')) return;
    try {
      if (type === 'lost') {
        await api.withdrawLostReport(id);
      } else {
        await api.withdrawFoundReport(id);
      }
      fetchHistory();
    } catch (err: any) {
      alert(err.message || 'Failed to withdraw report.');
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div className="border-b border-slate-200 pb-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span>Report Management</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Your Report History
        </h1>
        <p className="text-sm text-slate-500">
          Track, manage, and edit all lost and found reports submitted from your account.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto space-x-4 sm:space-x-8 text-xs sm:text-sm font-semibold">
        {(['all', 'lost', 'found', 'active', 'resolved', 'withdrawn'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 capitalize transition whitespace-nowrap ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab === 'all' ? 'All Reports' : tab === 'resolved' ? 'Resolved / Returned' : tab}
          </button>
        ))}
      </div>

      {/* Report Table / List */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading report records...</div>
      ) : filteredReports.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <Package className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No {activeTab} reports found</h3>
          <p className="text-xs text-slate-500">Reports filed by you will be listed here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((r) => {
            const isLost = r._type === 'lost';
            const imageUrl = r.images && r.images.length > 0 ? r.images[0].file_path : null;

            return (
              <div
                key={`${r._type}-${r.id}`}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition"
              >
                <div className="flex items-start space-x-4">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                    {imageUrl ? (
                      <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{r._type}</span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white ${
                        isLost ? 'bg-red-600' : 'bg-emerald-600'
                      }`}>
                        {r._type}
                      </span>
                      <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {r.report_id}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        r.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                        r.status === 'resolved' || r.status === 'returned' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {r.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm">{r.item_name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{r.description}</p>
                    <div className="text-[11px] text-slate-400 flex items-center space-x-3 pt-1">
                      <span>{r.location}</span>
                      <span>•</span>
                      <span>Submitted on {new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 self-end sm:self-auto pt-2 sm:pt-0">
                  <Link
                    to={`/${r._type}-items/${r.report_id}`}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                  >
                    View Details
                  </Link>

                  {r.status === 'active' && (
                    <button
                      onClick={() => handleWithdraw(r._type, r.id)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition"
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
