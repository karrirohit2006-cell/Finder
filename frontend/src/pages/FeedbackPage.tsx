import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Star, CheckCircle2, AlertCircle, MessageSquareQuote, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const FeedbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const requestIdParam = searchParams.get('request_id');
  const requestCodeParam = searchParams.get('request_code');

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Title */}
      <div className="border-b border-slate-200 pb-5 max-w-2xl">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Campus Recovery Feedback
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Share your recovery experience. Verified community feedback ensures accountability and mutual trust across the university.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Submit Feedback Form */}
        <div className="lg:col-span-1 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900">Submit Your Experience</h2>

          {success ? (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs space-y-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <p className="font-bold text-sm">Thank You for Your Feedback!</p>
              <p className="leading-relaxed">
                Your feedback has been verified and added to the community rating statistics.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="text-xs text-blue-600 font-semibold hover:underline block pt-1"
              >
                Submit another review
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Select Completed Recovery */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Completed Recovery <span className="text-red-500">*</span>
                </label>
                {completedRequests.length === 0 ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
                    You do not have any completed recoveries yet. Feedback is enabled once both parties confirm item return.
                  </div>
                ) : (
                  <select
                    value={requestId || ''}
                    onChange={(e) => setRequestId(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 outline-none"
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
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Rating (1 to 5 Stars) <span className="text-red-500">*</span>
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
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">{rating}/5 Stars</span>
                </div>
              </div>

              {/* Experience Tag */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Experience Highlight
                </label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:border-blue-500 outline-none"
                >
                  <option value="Smooth & Trustworthy">Smooth & Trustworthy</option>
                  <option value="Quick Campus Coordination">Quick Campus Coordination</option>
                  <option value="Helpful & Polite">Helpful & Polite</option>
                  <option value="Excellent Student Integrity">Excellent Student Integrity</option>
                </select>
              </div>

              {/* Written Review */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Written Feedback <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details of how you connected, where the handoff occurred..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || completedRequests.length === 0}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 transition disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Verified Feedback'}
              </button>
            </form>
          )}

        </div>

        {/* Right: Community Ratings & Testimonials */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Rating Summary Banner */}
          <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 text-white p-6 sm:p-8 rounded-3xl border border-navy-700 shadow-md flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-blue-300 font-semibold block">
                Community Trust Score
              </span>
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-4xl font-extrabold text-white">{summary.average_rating}</span>
                <div>
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400">Based on {summary.total_feedbacks} verified handoffs</span>
                </div>
              </div>
            </div>

            <div className="hidden sm:block text-right">
              <span className="inline-block px-3 py-1 rounded-full bg-blue-900/60 border border-blue-500/40 text-blue-300 text-xs font-bold">
                100% Peer Verified
              </span>
            </div>
          </div>

          {/* Testimonials List */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Recent Community Experiences</h3>

            {publicFeedbacks.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                No feedback published yet. Be the first to share your recovery story!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {publicFeedbacks.map((fb) => (
                  <div
                    key={fb.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex text-amber-400">
                          {Array.from({ length: fb.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(fb.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 italic leading-relaxed">
                        "{fb.comment}"
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-800">{fb.user_name}</span>
                      {fb.recovery_experience && (
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                          {fb.recovery_experience}
                        </span>
                      )}
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
