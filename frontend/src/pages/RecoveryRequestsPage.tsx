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
  ExternalLink,
  ChevronRight,
  Sparkles,
  HeartHandshake
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ConfirmModal } from '../components/ConfirmModal';
import { EmptyState } from '../components/EmptyState';

export const RecoveryRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const { code } = useParams<{ code?: string }>();
  const [requests, setRequests] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'completed'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Modal State for Confirmations
  const [activeModal, setActiveModal] = useState<{
    type: 'accept' | 'reject' | 'cancel' | 'confirm_return';
    reqCode: string;
    id: number;
    title: string;
    message: string;
    variant: 'danger' | 'warning' | 'primary' | 'success';
    confirmText: string;
  } | null>(null);

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

  const handleModalConfirm = async () => {
    if (!activeModal) return;
    const { type, reqCode, id } = activeModal;
    setActionLoading(id);
    try {
      if (type === 'accept') {
        await api.acceptRecovery(reqCode);
      } else if (type === 'reject') {
        await api.rejectRecovery(reqCode);
      } else if (type === 'cancel') {
        await api.cancelRecovery(reqCode);
      } else if (type === 'confirm_return') {
        await api.confirmReturn(reqCode);
      }
      setActiveModal(null);
      fetchRequests();
    } catch (err: any) {
      alert(err.message || 'Operation failed.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-xs font-black uppercase tracking-wider mb-2 border border-blue-200 dark:border-blue-900">
            <RotateCcw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Campus Recovery System</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Recovery Requests & Handoffs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage peer recovery requests, exchange private contact details securely, and complete verified handoffs.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6 text-xs sm:text-sm font-bold">
        {(['all', 'pending', 'accepted', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`pb-3 capitalize transition relative ${
              filter === tab
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab} Requests
          </button>
        ))}
      </div>

      {/* Requests List */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>Loading recovery requests...</span>
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          title={`No ${filter !== 'all' ? filter : ''} Recovery Requests Found`}
          description="When someone sends a recovery request for an item you found, or when you claim a lost item, handshakes appear here."
          actionText="Browse Found Items"
          onAction={() => window.location.href = '/found-items'}
          secondaryActionText="Browse Lost Items"
          onSecondaryAction={() => window.location.href = '/lost-items'}
        />
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
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 p-6 sm:p-8 shadow-sm hover:shadow-md transition space-y-6"
              >
                {/* Header: Code & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-sm font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 px-3 py-1 rounded-xl">
                      {req.request_code}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Initiated on {new Date(req.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <div>
                    <span
                      className={`px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        req.status === 'accepted' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        req.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                        req.status === 'rejected' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                        req.status === 'cancelled' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' :
                        'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                </div>

                {/* Connected Items Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Lost Item */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
                      Lost Item Report
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      {req.lost_report?.item_name || 'Lost Belonging'}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {req.lost_report?.description || 'No description'}
                    </p>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between pt-1">
                      <span>{req.lost_report?.location}</span>
                      <Link
                        to={`/lost-items/${req.lost_report?.report_id}`}
                        className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center space-x-1"
                      >
                        <span>View Report</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  {/* Found Item */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                      Found Item Report
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      {req.found_report?.item_name || 'Found Belonging'}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {req.found_report?.description || 'No description'}
                    </p>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between pt-1">
                      <span>{req.found_report?.location}</span>
                      <Link
                        to={`/found-items/${req.found_report?.report_id}`}
                        className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center space-x-1"
                      >
                        <span>View Report</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                </div>

                {/* Optional Message */}
                {req.message && (
                  <div className="p-4 bg-blue-50/70 dark:bg-blue-950/40 rounded-2xl border border-blue-100 dark:border-blue-900/60 text-xs text-slate-700 dark:text-slate-200">
                    <span className="font-bold text-blue-900 dark:text-blue-300 block mb-1">
                      Verification Message from Requester:
                    </span>
                    <p className="italic">"{req.message}"</p>
                  </div>
                )}

                {/* Contact Sharing Section (Unlocked upon mutual acceptance) */}
                {(isAccepted || isCompleted) && partner && (
                  <div className="p-5 sm:p-6 bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-950/40 dark:to-blue-950/40 rounded-3xl border border-emerald-200 dark:border-emerald-800 space-y-4">
                    <div className="flex items-center space-x-2 text-emerald-900 dark:text-emerald-200">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <h4 className="font-black text-sm">Verified Contact Details Exchanged</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Full Name</span>
                        <span className="font-black text-slate-900 dark:text-white text-sm">{partner.full_name}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize block">({partner.account_type})</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Mobile Number</span>
                        <a href={`tel:${partner.mobile_number}`} className="font-bold text-blue-700 dark:text-blue-400 text-sm hover:underline">
                          {partner.mobile_number}
                        </a>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block mb-0.5">
                          {partner.account_type === 'student' ? 'Branch & Year' : 'Department & Role'}
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {partner.account_type === 'student'
                            ? `${partner.branch} • ${partner.academic_year}`
                            : `${partner.department} • ${partner.designation}`}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap gap-3">
                      <Link
                        to="/messages"
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center space-x-1.5 transition"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Open Private In-App Chat</span>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Two-Party Return Confirmation Tracker */}
                {isAccepted && (
                  <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <h4 className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                      <HeartHandshake className="w-4 h-4 text-emerald-600" />
                      <span>Item Return Confirmation (Both Parties Must Confirm)</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                        myConfirmed 
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold' 
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}>
                        <span>Your Return Confirmation:</span>
                        <span className="font-extrabold">{myConfirmed ? 'Confirmed ✓' : 'Pending'}</span>
                      </div>
                      <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                        partnerConfirmed 
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold' 
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}>
                        <span>Partner's Return Confirmation:</span>
                        <span className="font-extrabold">{partnerConfirmed ? 'Confirmed ✓' : 'Pending'}</span>
                      </div>
                    </div>

                    {!myConfirmed && (
                      <button
                        onClick={() => setActiveModal({
                          type: 'confirm_return',
                          reqCode: req.request_code,
                          id: req.id,
                          title: 'Confirm Item Return Handoff',
                          message: 'Please confirm that the item has been physically handed over and inspected. Once both parties confirm, this recovery is officially completed.',
                          variant: 'success',
                          confirmText: 'Yes, Item Returned'
                        })}
                        disabled={actionLoading === req.id}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
                      >
                        Confirm That Item Has Been Handed Over
                      </button>
                    )}
                  </div>
                )}

                {/* Completed Recovery Feedback Link */}
                {isCompleted && (
                  <div className="p-4 sm:p-5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5 text-xs text-blue-900 dark:text-blue-200">
                      <span className="font-black text-sm">Item Successfully Restored!</span>
                      <p className="text-[11px] text-blue-800 dark:text-blue-300">Please share your experience to help build campus community trust.</p>
                    </div>
                    <Link
                      to={`/feedback/new?request_id=${req.id}`}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/30 transition shrink-0 flex items-center space-x-1.5"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-300" />
                      <span>Leave Recovery Feedback</span>
                    </Link>
                  </div>
                )}

                {/* Action Buttons for Pending Requests */}
                {req.status === 'pending' && (
                  <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {isReceiver && (
                      <>
                        <button
                          onClick={() => setActiveModal({
                            type: 'accept',
                            reqCode: req.request_code,
                            id: req.id,
                            title: 'Accept Recovery Request',
                            message: 'Accepting this request will reveal contact information to each other and unlock the private in-app chat.',
                            variant: 'success',
                            confirmText: 'Accept Request'
                          })}
                          disabled={actionLoading === req.id}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition"
                        >
                          Accept Recovery Request
                        </button>
                        <button
                          onClick={() => setActiveModal({
                            type: 'reject',
                            reqCode: req.request_code,
                            id: req.id,
                            title: 'Decline Recovery Request',
                            message: 'Are you sure you want to decline this request? Contact details will remain hidden.',
                            variant: 'danger',
                            confirmText: 'Decline Request'
                          })}
                          disabled={actionLoading === req.id}
                          className="px-5 py-2.5 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-bold text-xs rounded-xl border border-rose-200 dark:border-rose-900 transition"
                        >
                          Decline Request
                        </button>
                      </>
                    )}

                    {isRequester && (
                      <button
                        onClick={() => setActiveModal({
                          type: 'cancel',
                          reqCode: req.request_code,
                          id: req.id,
                          title: 'Cancel Recovery Request',
                          message: 'Cancel this recovery request? You can send another request later if needed.',
                          variant: 'warning',
                          confirmText: 'Cancel Request'
                        })}
                        disabled={actionLoading === req.id}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition"
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

      {/* Confirmation Modal */}
      {activeModal && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          onConfirm={handleModalConfirm}
          title={activeModal.title}
          message={activeModal.message}
          confirmText={activeModal.confirmText}
          variant={activeModal.variant}
          isLoading={actionLoading !== null}
        />
      )}

    </div>
  );
};
