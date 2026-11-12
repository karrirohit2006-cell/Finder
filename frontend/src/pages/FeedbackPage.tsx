import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Star, CheckCircle2, AlertCircle, MessageSquareQuote, ShieldCheck, Sparkles, User } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { EmptyState } from '../components/EmptyState';

export const FeedbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const requestIdParam = searchParams.get('request_id');

  const { user } = useAuth();
  const navigate = useNavigate();

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [experience, setExperience] = useState('Smooth & Trustworthy');
  const [requestId, setRequestId] = useState<number | null>(requestIdParam ? Number(requestIdParam) : null);

  const [completedRequests, setCompletedRequests] = useState<any[]>([]);
  const [publicFeedbacks, setPublicFeedbacks] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({ total_feedbacks: 0, average_rating: 5.0 });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getPublicFeedback().then(setPublicFeedbacks).catch(() => {});
    api.getFeedbackSummary().then(setSummary).catch(() => {});

    if (user) {
      api.getMyRecoveryRequests('completed').then((reqs) => {
        setCompletedRequests(reqs);
        if (!requestId && reqs.length > 0) {
          setRequestId(reqs[0].id);
        }
      }).catch(() => {});
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!requestId) {
      setError('Please select the completed recovery request for which you are submitting feedback.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.submitFeedback({
        recovery_request_id: requestId,
        rating,
        comment: comment.trim(),
        recovery_experience: experience
      });
      setSuccess(true);
      // Reload feedbacks
      api.getPublicFeedback().then(setPublicFeedbacks).catch(() => {});
      api.getFeedbackSummary().then(setSummary).catch(() => {});
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      
      {/* Title */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5 max-w-2xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-200 dark:border-amber-900">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>Peer Verification & Reviews</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Campus Recovery Reviews
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Share your recovery experience. Verified community feedback ensures accountability, honesty, and mutual trust across Lovely Professional University.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Submit Feedback Form */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-6 h-fit">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Submit Recovery Review</h2>

          {success ? (
            <div className="p-5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-900 dark:text-emerald-200 text-xs space-y-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <p className="font-bold text-sm">Thank You for Your Feedback!</p>
              <p className="leading-relaxed">
                Your feedback has been verified and added to the community rating statistics.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline block pt-1"
              >
                Submit another review
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {error && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Select Completed Recovery */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Completed Recovery <span className="text-rose-500">*</span>
                </label>
                {completedRequests.length === 0 ? (
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500 dark:text-slate-400">
                    You do not have any completed recoveries yet. Feedback is enabled once both parties confirm item return.
                  </div>
                ) : (
                  <select
                    value={requestId || ''}
                    onChange={(e) => setRequestId(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 outline-none"
                  >
                    {completedRequests.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.request_code} — {r.lost_report?.item_name || 'Item'}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Star Rating */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Rating (1 to 5 Stars) <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setRating(s)}
                      className="p-1 hover:scale-110 transition transform focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          s <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">{rating}/5 Stars</span>
                </div>
              </div>

              {/* Experience Tag */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Experience Highlight
                </label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-medium focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 outline-none"
                >
                  <option value="Smooth & Trustworthy">Smooth & Trustworthy</option>
                  <option value="Quick Campus Coordination">Quick Campus Coordination</option>
                  <option value="Helpful & Polite">Helpful & Polite</option>
                  <option value="Excellent Student Integrity">Excellent Student Integrity</option>
                </select>
              </div>

              {/* Written Review */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Written Feedback <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details of how you connected, where the handoff occurred..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 outline-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || completedRequests.length === 0}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black shadow-md shadow-blue-600/30 transition disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Post Verified Review'}
              </button>
            </form>
          )}
        </div>

        {/* Right: Reviews Feed & Summary */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Summary Banner */}
          <div className="bg-gradient-to-r from-blue-900 via-navy-900 to-navy-950 text-white p-6 rounded-3xl shadow-lg border border-blue-800 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider text-blue-300 font-bold block">
                Platform Satisfaction Score
              </span>
              <div className="flex items-center space-x-3">
                <span className="text-4xl font-black">{summary.average_rating || 5.0}</span>
                <div className="flex items-center text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-5 h-5 fill-amber-400" />
                  ))}
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="block text-2xl font-black">{summary.total_feedbacks || 0}</span>
              <span className="text-xs text-slate-300">Verified Recoveries</span>
            </div>
          </div>

          {/* Feedback Cards */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Recent Verified Community Testimonials
            </h3>

            {publicFeedbacks.length === 0 ? (
              <EmptyState
                title="No Community Reviews Yet"
                description="Once students and staff complete recovery handoffs and share feedback, their ratings will be showcased here."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {publicFeedbacks.map((fb) => (
                  <div
                    key={fb.id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-md transition space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-amber-400">
                          {[...Array(fb.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-amber-400" />
                          ))}
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                          {fb.recovery_experience}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
                        "{fb.comment}"
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{fb.author_name}</span>
                      <span>{new Date(fb.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
