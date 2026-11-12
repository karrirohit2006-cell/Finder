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
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SafetyModal } from '../components/SafetyModal';

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
      // If current item is found, user needs to pick their lost report
      // If current item is lost, user needs to pick their found report
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

  const handleWithdraw = async () => {
    if (!window.confirm('Are you sure you want to withdraw this report?')) return;
    try {
      if (type === 'lost') {
        await api.withdrawLostReport(item.id);
      } else {
        await api.withdrawFoundReport(item.id);
      }
      alert('Report withdrawn successfully.');
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.message || 'Failed to withdraw report.');
    }
  };

  if (isLoading) {
    return <div className="max-w-4xl mx-auto py-20 text-center text-slate-400 text-sm">Loading item details...</div>;
  }

  if (error || !item) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Report Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'This report may have been withdrawn or does not exist.'}</p>
        <Link to={`/${type}-items`} className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold">
          Return to directory
        </Link>
      </div>
    );
  }

  const rawDate = item.lost_date || item.found_date;
  const formattedDate = rawDate
    ? new Date(rawDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Recent';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back button */}
      <div>
        <Link
          to={`/${type}-items`}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {type === 'lost' ? 'Lost Items' : 'Found Items'}</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-10">
        
        {/* Left: Photos & Carousel */}
        <div className="space-y-4">
          <div className="aspect-square w-full rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 relative">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={item.item_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6">
                <Tag className="w-12 h-12 mb-2 text-slate-300" />
                <span className="text-xs">No photograph provided for this item</span>
              </div>
            )}

            <div className="absolute top-3 left-3">
              <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider text-white shadow-md ${
                type === 'lost' ? 'bg-red-600' : 'bg-emerald-600'
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
                    selectedImage === img.file_path ? 'border-blue-600 shadow-sm' : 'border-slate-200 opacity-70 hover:opacity-100'
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
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                {item.report_id}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                item.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                item.status === 'resolved' || item.status === 'returned' ? 'bg-blue-100 text-blue-800' :
                'bg-slate-100 text-slate-700'
              }`}>
                Status: {item.status.replace('_', ' ')}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {item.item_name}
            </h1>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
              <div className="flex items-center text-slate-700">
                <Tag className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <span className="font-semibold mr-1.5">Category:</span>
                <span>{item.category}</span>
              </div>
              <div className="flex items-center text-slate-700">
                <MapPin className="w-4 h-4 text-blue-600 mr-2 shrink-0" />
                <span className="font-semibold mr-1.5">Campus Location:</span>
                <span>{item.location}</span>
              </div>
              <div className="flex items-center text-slate-700">
                <Calendar className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <span className="font-semibold mr-1.5">Date:</span>
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center text-slate-700">
                <Clock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <span className="font-semibold mr-1.5">Time:</span>
                <span>{item.approx_time}</span>
              </div>
              {item.colour && (
                <div className="flex items-center text-slate-700">
                  <span className="w-4 h-4 inline-flex items-center justify-center font-bold text-slate-400 mr-2 shrink-0">•</span>
                  <span className="font-semibold mr-1.5">Colour:</span>
                  <span>{item.colour}</span>
                </div>
              )}
              {item.brand && (
                <div className="flex items-center text-slate-700">
                  <span className="w-4 h-4 inline-flex items-center justify-center font-bold text-slate-400 mr-2 shrink-0">•</span>
                  <span className="font-semibold mr-1.5">Brand:</span>
                  <span>{item.brand}</span>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Description & Observations
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {item.description || item.additional_observations || item.additional_details}
              </p>
            </div>

            {/* Privacy Shield Notice */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-900 flex items-start space-x-2.5">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold">Contact Privacy Enforced:</span>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Personal phone numbers and registration IDs remain strictly concealed until a recovery request is accepted by both participants.
                </p>
              </div>
            </div>

          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
            {item.is_owner ? (
              <div className="w-full flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">You reported this item</span>
                {item.status === 'active' && (
                  <button
                    onClick={handleWithdraw}
                    className="px-4 py-2 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
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
                  className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-600/30 flex items-center justify-center space-x-2 transition disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {type === 'found' ? 'Claim This Item (Send Recovery Request)' : 'I Found This Item (Send Recovery Request)'}
                  </span>
                </button>

                <button
                  onClick={() => setIsSafetyOpen(true)}
                  className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition"
                  title="Report Suspicious Content"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                </button>
              </>
            )}
          </div>

        </div>

      </div>

      {/* Recovery Request Initiation Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <h3 className="text-lg font-bold text-slate-900">
              Initiate Recovery Request
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Connect this {type} item with your corresponding active report. The recipient will be notified and can review your match.
            </p>

            {requestSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{requestSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleSendRecoveryRequest} className="space-y-4">
                
                {myComplementaryReports.length === 0 ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-2">
                    <p className="font-semibold">
                      You do not have any active {type === 'found' ? 'Lost' : 'Found'} reports to connect.
                    </p>
                    <p>
                      To prevent false claims and keep records accurate, please file your report first:
                    </p>
                    <Link
                      to={type === 'found' ? '/report/lost' : '/report/found'}
                      className="inline-block px-3 py-1.5 bg-amber-600 text-white font-bold rounded-lg text-xs"
                    >
                      File {type === 'found' ? 'Lost Item Report' : 'Found Item Report'}
                    </Link>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Select Your Matching {type === 'found' ? 'Lost' : 'Found'} Report <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedMyReportId || ''}
                      onChange={(e) => setSelectedMyReportId(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 outline-none"
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Verification Message (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder="Provide verifying details (e.g., serial number suffix, keychain initials, unique scratch)..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRequestModalOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingRequest || myComplementaryReports.length === 0}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 transition disabled:opacity-50"
                  >
                    {isSendingRequest ? 'Sending...' : 'Send Recovery Request'}
                  </button>
                </div>

              </form>
            )}
          </div>
        </div>
      )}

      {/* Safety Modal */}
      <SafetyModal
        isOpen={isSafetyOpen}
        onClose={() => setIsSafetyOpen(false)}
        targetUserId={item.user_id}
        targetUserName={item.reporter_name}
      />

    </div>
  );
};
