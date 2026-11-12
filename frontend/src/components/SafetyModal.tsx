import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, X, CheckCircle, Ban } from 'lucide-react';
import { api } from '../services/api';

interface SafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId?: number;
  targetUserName?: string;
  conversationId?: number;
  reportedItemId?: number;
  reportType?: 'lost' | 'found';
}

export const SafetyModal: React.FC<SafetyModalProps> = ({
  isOpen,
  onClose,
  targetUserId,
  targetUserName = 'this user',
  conversationId,
  reportedItemId,
  reportType
}) => {
  const [reason, setReason] = useState('Suspicious communication');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await api.reportUser({
        reported_user_id: targetUserId,
        conversation_id: conversationId,
        reason,
        details
      });
      setSuccessMsg(res.message);
    } catch (err: any) {
      setError(err.message || 'Failed to file report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBlock = async () => {
    if (!targetUserId) return;
    try {
      await api.blockUser(targetUserId);
      alert(`${targetUserName} has been blocked. They cannot message you.`);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to block user.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative animate-in zoom-in-95 duration-200 text-slate-900 dark:text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-base">Safety & Moderation Report</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Report suspicious behavior or policy abuse</p>
          </div>
        </div>

        {successMsg ? (
          <div className="space-y-4 py-2">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs leading-relaxed flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <span>{successMsg}</span>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-3.5 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
              <span className="font-bold">Campus Security Notice:</span> Reports are recorded in the system. For urgent campus emergencies or immediate safety threats, please contact LPU Security Helpline (+91 1824 517100) or Student Services (Block 32, Room 302).
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Reason for Safety Report
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white p-2.5 focus:border-blue-500 outline-none"
              >
                <option value="Suspicious communication">Suspicious or fraudulent communication</option>
                <option value="Inappropriate meeting location">Refusal to meet at official campus spots</option>
                <option value="False claim of ownership">False or duplicate item ownership claim</option>
                <option value="Harassment or abuse">Harassment, threats, or abusive language</option>
                <option value="Other security concern">Other safety or policy concern</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Incident Details & Explanation
              </label>
              <textarea
                rows={3}
                required
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe what occurred, dates, and locations..."
                className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white p-2.5 focus:border-blue-500 outline-none"
              />
            </div>

            {error && (
              <p className="text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/50 p-2.5 rounded-xl">{error}</p>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition"
              >
                {isSubmitting ? 'Filing Report...' : 'File Safety Report'}
              </button>

              {targetUserId && (
                <button
                  type="button"
                  onClick={handleBlock}
                  className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition"
                >
                  <Ban className="w-3.5 h-3.5 text-rose-500" />
                  <span>Block User</span>
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
