import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Tag, 
  Send, 
  ShieldCheck, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2,
  Trash2,
  User,
  ShieldAlert,
  Sparkles,
  Lock,
  Layers,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SafetyModal } from '../components/SafetyModal';
import { ConfirmModal } from '../components/ConfirmModal';

export const ItemDetailPage: React.FC<{ type: 'lost' | 'found' }> = ({ type }) => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Recovery Request Modal State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [myComplementaryReports, setMyComplementaryReports] = useState<any[]>([]);
  const [selectedMyReportId, setSelectedMyReportId] = useState<number | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);

  // Confirmation Modals
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Safety Modal
  const [isSafetyOpen, setIsSafetyOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    const fetchItem = type === 'lost' ? api.getLostReport(id) : api.getFoundReport(id);

    fetchItem
      .then((data) => {
        setItem(data);
        if (data.images && data.images.length > 0) {
          setSelectedImage(data.images[0].file_path);
        }
      })
      .catch((err) => setError(err.message || 'Item not found'))
      .finally(() => setIsLoading(false));
  }, [id, type]);

  // Load user's own reports if initiating a recovery request
  const openRecoveryModal = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const history = await api.getUserHistory();
      const eligible = type === 'found' ? history.lost_reports : history.found_reports;
      const activeEligible = eligible.filter((r: any) => r.status === 'active');
      setMyComplementaryReports(activeEligible);
      if (activeEligible.length > 0) {
        setSelectedMyReportId(activeEligible[0].id);
      }
      setIsRequestModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendRecoveryRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMyReportId) {
      alert(`Please select or first create a ${type === 'found' ? 'Lost' : 'Found'} report to connect.`);
      return;
    }

    setIsSendingRequest(true);
    try {
      const lostId = type === 'found' ? selectedMyReportId : item.id;
      const foundId = type === 'found' ? item.id : selectedMyReportId;

      const res = await api.createRecoveryRequest({
        lost_report_id: lostId,
        found_report_id: foundId,
        message: requestMessage.trim() || undefined
      });

      setRequestSuccess(`Recovery request sent successfully (${res.request_code}). The other party has been notified.`);
      setTimeout(() => {
        setIsRequestModalOpen(false);
        navigate(`/recovery/${res.request_code}`);
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to send recovery request.');
    } finally {
      setIsSendingRequest(false);
    }
  };

  const handleWithdrawConfirm = async () => {
    setIsWithdrawing(true);
    try {
      if (type === 'lost') {
        await api.withdrawLostReport(item.id);
      } else {
        await api.withdrawFoundReport(item.id);
      }
      setIsWithdrawModalOpen(false);
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.message || 'Failed to withdraw report.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6 animate-pulse">
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center space-y-5 px-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto shadow-sm">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Report Not Found</h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {error || 'This report may have been withdrawn by the reporter or does not exist.'}
        </p>
        <Link 
          to={`/${type}-items`} 
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold shadow-md shadow-blue-600/20 transition"
        >
          Return to {type === 'lost' ? 'Lost Items' : 'Found Items'}
        </Link>
      </div>
    );
  }

  const rawDate = item.lost_date || item.found_date;
  const formattedDate = rawDate
    ? new Date(rawDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Recent';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Back button */}
      <div>
        <Link
          to={`/${type}-items`}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {type === 'lost' ? 'Lost Items Directory' : 'Found Items Inventory'}</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-10">
        
        {/* Left: Photos & Carousel */}
        <div className="space-y-4">
          <div className="aspect-square w-full rounded-2xl bg-slate-100 dark:bg-slate-800/60 overflow-hidden border border-slate-200 dark:border-slate-800 relative">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={item.item_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6">
                <Tag className="w-12 h-12 mb-2 text-slate-300 dark:text-slate-600" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  No photograph provided for this item
                </span>
              </div>
            )}

            <div className="absolute top-3 left-3">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-white shadow-md ${
                type === 'lost' ? 'bg-rose-600' : 'bg-emerald-600'
              }`}>
                {type}
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          {item.images && item.images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {item.images.map((img: any) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.file_path)}
                  className={`relative w-16 h-16 rounded-xl border-2 overflow-hidden shrink-0 transition ${
                    selectedImage === img.file_path 
                      ? 'border-blue-600 shadow-md ring-2 ring-blue-500/20' 
                      : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.file_path} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details & Recovery Actions */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 px-3 py-1 rounded-lg">
                {item.report_id}
              </span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${
                item.status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                item.status === 'resolved' || item.status === 'returned' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}>
                {item.status.replace('_', ' ')}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {item.item_name}
            </h1>

            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2.5 text-xs">
              <div className="flex items-center text-slate-700 dark:text-slate-300">
                <Tag className="w-4 h-4 text-slate-400 dark:text-slate-500 mr-2 shrink-0" />
                <span className="font-bold mr-1.5">Category:</span>
                <span>{item.category}</span>
              </div>
              <div className="flex items-center text-slate-700 dark:text-slate-300">
                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2 shrink-0" />
                <span className="font-bold mr-1.5">Campus Location:</span>
                <span>{item.location}</span>
              </div>
              <div className="flex items-center text-slate-700 dark:text-slate-300">
                <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500 mr-2 shrink-0" />
                <span className="font-bold mr-1.5">Date Reported:</span>
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center text-slate-700 dark:text-slate-300">
                <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500 mr-2 shrink-0" />
                <span className="font-bold mr-1.5">Approx. Time:</span>
                <span>{item.approx_time || 'Not specified'}</span>
              </div>
              {item.colour && (
                <div className="flex items-center text-slate-700 dark:text-slate-300">
                  <span className="w-4 h-4 inline-flex items-center justify-center font-black text-slate-400 mr-2 shrink-0">•</span>
                  <span className="font-bold mr-1.5">Colour:</span>
                  <span>{item.colour}</span>
                </div>
              )}
              {item.brand && (
                <div className="flex items-center text-slate-700 dark:text-slate-300">
                  <span className="w-4 h-4 inline-flex items-center justify-center font-black text-slate-400 mr-2 shrink-0">•</span>
                  <span className="font-bold mr-1.5">Brand:</span>
                  <span>{item.brand}</span>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1.5">
                Description & Identifying Details
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {item.description || item.additional_observations || item.additional_details || 'No detailed description provided.'}
              </p>
            </div>

            {/* Privacy Shield Notice */}
            <div className="p-4 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 rounded-2xl text-xs text-blue-900 dark:text-blue-200 flex items-start space-x-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold">Contact Privacy Enforced:</span>
                <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
                  Personal phone numbers and student registration IDs remain strictly concealed until a recovery handshake is accepted by both participants.
                </p>
              </div>
            </div>

          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
            {item.is_owner ? (
              <div className="w-full flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">You reported this item</span>
                {item.status === 'active' && (
                  <button
                    onClick={() => setIsWithdrawModalOpen(true)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Withdraw Report</span>
                  </button>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={openRecoveryModal}
                  disabled={item.status !== 'active'}
                  className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {type === 'found' ? 'Claim This Item (Send Recovery Request)' : 'I Found This Item (Send Recovery Request)'}
                  </span>
                </button>

                <button
                  onClick={() => setIsSafetyOpen(true)}
                  className="p-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl transition"
                  title="Report Suspicious Content"
                >
                  <ShieldAlert className="w-5 h-5 text-amber-500" />
                </button>
              </>
            )}
          </div>

        </div>

      </div>

      {/* Recovery Request Initiation Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Initiate Recovery Handshake
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Connect this {type} item with your corresponding active report. The recipient will be notified and can review your match.
            </p>

            {requestSuccess ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{requestSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleSendRecoveryRequest} className="space-y-4">
                
                {myComplementaryReports.length === 0 ? (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-2xl text-xs text-amber-900 dark:text-amber-200 space-y-2">
                    <p className="font-bold">
                      You do not have any active {type === 'found' ? 'Lost' : 'Found'} reports to connect.
                    </p>
                    <p className="text-xs text-amber-800 dark:text-amber-300">
                      To prevent false claims and keep records accurate, please file your report first:
                    </p>
                    <Link
                      to={type === 'found' ? '/report/lost' : '/report/found'}
                      className="inline-block px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition"
                    >
                      File {type === 'found' ? 'Lost Item Report' : 'Found Item Report'}
                    </Link>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Select Your Matching {type === 'found' ? 'Lost' : 'Found'} Report <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedMyReportId || ''}
                      onChange={(e) => setSelectedMyReportId(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 outline-none"
                    >
                      {myComplementaryReports.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.report_id} — {r.item_name} ({r.category})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Verification Message (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder="Provide verifying details (e.g., serial number suffix, keychain initials, unique scratch)..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRequestModalOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingRequest || myComplementaryReports.length === 0}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 transition disabled:opacity-50"
                  >
                    {isSendingRequest ? 'Sending...' : 'Send Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Report Withdrawal Confirmation Modal */}
      <ConfirmModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        onConfirm={handleWithdrawConfirm}
        title="Withdraw Report"
        message="Are you sure you want to withdraw this report? It will no longer appear in campus search listings."
        confirmText="Withdraw Report"
        cancelText="Keep Active"
        variant="danger"
        isLoading={isWithdrawing}
      />

      {/* Safety & Moderation Modal */}
      <SafetyModal
        isOpen={isSafetyOpen}
        onClose={() => setIsSafetyOpen(false)}
        reportedItemId={item.id}
        reportType={type}
      />

    </div>
  );
};
