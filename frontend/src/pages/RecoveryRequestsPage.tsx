import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Phone, 
  User, 
  MessageSquare, 
  AlertCircle, 
  ShieldCheck, 
  Star,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const RecoveryRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const { code } = useParams<{ code?: string }>();
  const [requests, setRequests] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'completed'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchRequests = async () => {
    try {
      const data = await api.getMyRecoveryRequests(filter === 'all' ? undefined : filter);
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const handleAccept = async (reqCode: string, id: number) => {
    if (!window.confirm('Accept this recovery request? Contact details and private chat will be unlocked.')) return;
    setActionLoading(id);
    try {
      await api.acceptRecovery(reqCode);
      fetchRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to accept request.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (reqCode: string, id: number) => {
    if (!window.confirm('Decline this recovery request? Contact details will remain private.')) return;
    setActionLoading(id);
    try {
      await api.rejectRecovery(reqCode);
      fetchRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to reject request.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (reqCode: string, id: number) => {
    if (!window.confirm('Cancel this recovery request?')) return;
    setActionLoading(id);
    try {
      await api.cancelRecovery(reqCode);
      fetchRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel request.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmReturn = async (reqCode: string, id: number) => {
    if (!window.confirm('Confirm that the item has been returned? Both participants must confirm to complete recovery.')) return;
    setActionLoading(id);
    try {
      await api.confirmReturn(reqCode);
      alert('Return confirmation recorded!');
      fetchRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to confirm return.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">
            <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
            <span>Campus Recovery System</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Recovery Requests & Handoffs
          </h1>
          <p className="text-sm text-slate-500">
            Manage peer recovery requests, exchange private contact details securely, and confirm item returns.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm font-semibold">
        {(['all', 'pending', 'accepted', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`pb-3 capitalize transition relative ${
              filter === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab} Requests
          </button>
        ))}
      </div>

      {/* Requests List */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading recovery requests...</div>
      ) : requests.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <RotateCcw className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No {filter} recovery requests found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When someone claims an item you found, or when you claim a lost item, recovery requests appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map((req) => {
            const isRequester = req.is_requesting_user;
            const isReceiver = req.is_receiving_user;
            const isAccepted = req.status === 'accepted';
            const isCompleted = req.status === 'completed';
            const partner = req.partner_profile;

            const myConfirmed = isRequester
              ? req.lost_user_confirmed_return
              : req.found_user_confirmed_return;
            const partnerConfirmed = isRequester
              ? req.found_user_confirmed_return
              : req.lost_user_confirmed_return;

            return (
              <div
                key={req.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6"
              >
                {/* Header: Code & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg">
                      {req.request_code}
                    </span>
                    <span className="text-xs text-slate-500">
                      Initiated on {new Date(req.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        req.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                        req.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        req.status === 'cancelled' ? 'bg-slate-100 text-slate-700' :
                        'bg-amber-100 text-amber-800 animate-pulse'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                </div>

                {/* Connected Items Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Lost Item */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 block">
                      Lost Item Report
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {req.lost_report?.item_name || 'Lost Belonging'}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {req.lost_report?.description}
                    </p>
                    <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1">
                      <span>{req.lost_report?.location}</span>
                      <Link
                        to={`/lost-items/${req.lost_report?.report_id}`}
                        className="text-blue-600 font-semibold hover:underline flex items-center space-x-1"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  {/* Found Item */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
                      Found Item Report
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {req.found_report?.item_name || 'Found Belonging'}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {req.found_report?.description}
                    </p>
                    <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1">
                      <span>{req.found_report?.location}</span>
                      <Link
                        to={`/found-items/${req.found_report?.report_id}`}
                        className="text-blue-600 font-semibold hover:underline flex items-center space-x-1"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                </div>

                {/* Optional Message */}
                {req.message && (
                  <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-slate-700">
                    <span className="font-semibold text-blue-900 block mb-0.5">Verification Message:</span>
                    <p className="italic">"{req.message}"</p>
                  </div>
                )}

                {/* Contact Sharing Section (Section 11) */}
                {(isAccepted || isCompleted) && partner && (
                  <div className="p-5 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl border border-emerald-200 space-y-3">
                    <div className="flex items-center space-x-2 text-emerald-900">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <h4 className="font-bold text-sm">Verified Contact Details Exchanged</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-slate-500 block">Full Name</span>
                        <span className="font-bold text-slate-800 text-sm">{partner.full_name}</span>
                        <span className="text-[10px] text-slate-500 capitalize block">({partner.account_type})</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Mobile Number</span>
                        <a href={`tel:${partner.mobile_number}`} className="font-bold text-blue-700 text-sm hover:underline">
                          {partner.mobile_number}
                        </a>
                      </div>
                      <div>
                        <span className="text-slate-500 block">
                          {partner.account_type === 'student' ? 'Branch & Year' : 'Department & Role'}
                        </span>
                        <span className="font-semibold text-slate-800">
                          {partner.account_type === 'student'
                            ? `${partner.branch} • ${partner.academic_year}`
                            : `${partner.department} • ${partner.designation}`}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap gap-3">
                      <Link
                        to="/messages"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 transition"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Open Private In-App Chat</span>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Two-Party Return Confirmation Tracker (Section 13) */}
                {isAccepted && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                      Item Return Confirmation (Both Parties Must Confirm)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className={`p-3 rounded-xl border flex items-center justify-between ${
                        myConfirmed ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-white border-slate-200 text-slate-600'
                      }`}>
                        <span>Your Return Confirmation:</span>
                        <span className="font-bold">{myConfirmed ? 'Confirmed ✓' : 'Pending'}</span>
                      </div>
                      <div className={`p-3 rounded-xl border flex items-center justify-between ${
                        partnerConfirmed ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-white border-slate-200 text-slate-600'
                      }`}>
                        <span>Partner's Return Confirmation:</span>
                        <span className="font-bold">{partnerConfirmed ? 'Confirmed ✓' : 'Pending'}</span>
                      </div>
                    </div>

                    {!myConfirmed && (
                      <button
                        onClick={() => handleConfirmReturn(req.request_code, req.id)}
                        disabled={actionLoading === req.id}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition disabled:opacity-50"
                      >
                        Confirm That Item Has Been Handed Over
                      </button>
                    )}
                  </div>
                )}

                {/* Completed Recovery Feedback Link */}
                {isCompleted && (
                  <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between">
                    <div className="space-y-0.5 text-xs text-blue-900">
                      <span className="font-bold">Item Successfully Restored!</span>
                      <p className="text-[11px] text-blue-800">Please share your experience to help improve campus community trust.</p>
                    </div>
                    <Link
                      to={`/feedback/new?request_id=${req.id}`}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-sm transition shrink-0 flex items-center space-x-1.5"
                    >
                      <Star className="w-3.5 h-3.5" />
                      <span>Leave Feedback</span>
                    </Link>
                  </div>
                )}

                {/* Action Buttons for Pending Requests */}
                {req.status === 'pending' && (
                  <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100">
                    {isReceiver && (
                      <>
                        <button
                          onClick={() => handleAccept(req.request_code, req.id)}
                          disabled={actionLoading === req.id}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition"
                        >
                          Accept Recovery Request
                        </button>
                        <button
                          onClick={() => handleReject(req.request_code, req.id)}
                          disabled={actionLoading === req.id}
                          className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl transition"
                        >
                          Decline Request
                        </button>
                      </>
                    )}

                    {isRequester && (
                      <button
                        onClick={() => handleCancel(req.request_code, req.id)}
                        disabled={actionLoading === req.id}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
                      >
                        Cancel Request
                      </button>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
