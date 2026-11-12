import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, X, CheckCircle, Ban } from 'lucide-react';
import { api } from '../services/api';

interface SafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId?: number;
  targetUserName?: string;
  conversationId?: number;
}

export const SafetyModal: React.FC<SafetyModalProps> = ({
  isOpen,
  onClose,
  targetUserId,
  targetUserName = 'this user',
  conversationId
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Safety & Moderation Report</h3>
            <p className="text-xs text-slate-500">Report suspicious behavior or abuse</p>
          </div>
        </div>

        {successMsg ? (
          <div className="space-y-4 py-2">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs leading-relaxed flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-navy-900 text-white rounded-lg text-sm font-semibold hover:bg-navy-800 transition"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900 leading-relaxed">
              <span className="font-bold">Important University Notice:</span> Back2You does not have an administrator account or automated review workflow. Reports are archived for record. In case of emergency or immediate threat, contact LPU Security / Student Services directly.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Report
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-xs rounded-lg border-slate-300 bg-slate-50 p-2.5 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="Suspicious communication">Suspicious or fraudulent communication</option>
                <option value="Inappropriate meeting location">Refusal to meet at official campus spots</option>
                <option value="False claim of ownership">False or duplicate item ownership claim</option>
                <option value="Harassment or abuse">Harassment, threats, or abusive language</option>
                <option value="Other security concern">Other safety or policy concern</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Incident Details & Explanation
              </label>
              <textarea
                rows={3}
                required
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe what occurred, dates, and locations..."
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</p>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition"
              >
                {isSubmitting ? 'Filing Report...' : 'File Safety Report'}
              </button>

              {targetUserId && (
                <button
                  type="button"
                  onClick={handleBlock}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
                >
                  <Ban className="w-3.5 h-3.5 text-red-500" />
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
