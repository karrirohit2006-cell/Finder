import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Camera, 
  PlusCircle, 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  MapPin, 
  ArrowRight, 
  HelpCircle,
  Clock,
  CheckCircle2,
  Users,
  Compass
} from 'lucide-react';
import { api } from '../services/api';
import { ItemCard } from '../components/ItemCard';

export const LandingPage: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [recentLost, setRecentLost] = useState<any[]>([]);
  const [recentFound, setRecentFound] = useState<any[]>([]);
  const [feedbackSummary, setFeedbackSummary] = useState<any>({ total_feedbacks: 0, average_rating: 5.0 });
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch recently reported items
    api.getLostReports({ limit: '4' }).then(setRecentLost).catch(() => {});
    api.getFoundReports({ limit: '4' }).then(setRecentFound).catch(() => {});
    api.getFeedbackSummary().then(setFeedbackSummary).catch(() => {});
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (keyword.trim()) query.set('q', keyword.trim());
    if (selectedCategory !== 'All') query.set('category', selectedCategory);
    navigate(`/lost-items?${query.toString()}`);
  };

  const categories = [
    'All', 'Electronics', 'Mobile phones', 'Laptops', 'Wallets', 'Bags', 'ID cards', 'Keys', 'Watches', 'Water bottles'
  ];

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section with Academic Navy Portal Theme */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 text-white py-16 sm:py-24 border-b border-navy-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.25),rgba(255,255,255,0))]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-900/60 border border-blue-500/40 text-blue-300 text-xs font-semibold backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-500">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI & Computer Vision Powered Lost & Found • Lovely Professional University</span>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Lost something? Found something? <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-blue-200">
                Let's bring it Back2You.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              The modern, private, and intelligent campus recovery network for LPU students and faculty. Secure image similarity matching, private messaging, and verified handoffs.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/report/lost"
              className="px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm shadow-lg shadow-red-600/30 flex items-center space-x-2 transition transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Report Lost Item</span>
            </Link>

            <Link
              to="/report/found"
              className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 flex items-center space-x-2 transition transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Report Found Item</span>
            </Link>

            <Link
              to="/search/image"
              className="px-6 py-3.5 rounded-xl bg-navy-800/80 hover:bg-navy-700 text-blue-300 font-semibold text-sm border border-blue-500/40 shadow-md flex items-center space-x-2 transition transform hover:-translate-y-0.5"
            >
              <Camera className="w-5 h-5 text-blue-400" />
              <span>Search by Image</span>
            </Link>
          </div>

          {/* Live Search Bar */}
          <div className="max-w-3xl mx-auto pt-6">
            <form onSubmit={handleSearchSubmit} className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-2xl flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Search item name, brand, color (e.g. Blue Dell laptop, UniMall keys)..."
                  className="w-full pl-11 pr-4 py-3 bg-navy-950/80 text-white placeholder-slate-400 rounded-xl border border-navy-700/80 focus:border-blue-500 focus:outline-none text-sm"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-navy-950/80 text-white px-3 py-3 rounded-xl border border-navy-700/80 text-sm focus:border-blue-500 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-navy-900 text-white">
                    {c}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition shrink-0"
              >
                Search
              </button>
            </form>
          </div>

          {/* Trust Metrics */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-navy-800/80 text-center">
            <div>
              <span className="block text-2xl font-bold text-white">100%</span>
              <span className="text-xs text-slate-400">Campus Contact Privacy</span>
            </div>
            <div>
              <span className="block text-2xl font-bold text-blue-400">128-Dim</span>
              <span className="text-xs text-slate-400">Computer Vision Vectors</span>
            </div>
            <div>
              <span className="block text-2xl font-bold text-emerald-400">Two-Party</span>
              <span className="text-xs text-slate-400">Confirmed Handoffs</span>
            </div>
            <div>
              <span className="block text-2xl font-bold text-amber-400">
                {feedbackSummary.average_rating} ★
              </span>
              <span className="text-xs text-slate-400">Student Satisfaction</span>
            </div>
          </div>

        </div>
      </section>

      {/* Recently Reported Items */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Recent Lost Items */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
                <span>Recently Reported Lost Items</span>
              </h2>
              <p className="text-sm text-slate-500">Items reported lost by students and staff across LPU blocks</p>
            </div>
            <Link
              to="/lost-items"
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <span>View all lost items</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentLost.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
              No lost items reported recently.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentLost.map((item) => (
                <ItemCard key={item.id} item={item} type="lost" />
              ))}
            </div>
          )}
        </div>

        {/* Recent Found Items */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                <span>Recently Reported Found Items</span>
              </h2>
              <p className="text-sm text-slate-500">Items found and photographed awaiting their rightful owners</p>
            </div>
            <Link
              to="/found-items"
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <span>View all found items</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentFound.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
              No found items reported recently.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentFound.map((item) => (
                <ItemCard key={item.id} item={item} type="found" />
              ))}
            </div>
          )}
        </div>

      </section>

      {/* How It Works Section */}
      <section className="bg-slate-100 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">How Back2You Works</h2>
            <p className="text-sm text-slate-600">
              A structured 4-step recovery process engineered for trust, privacy, and speed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 relative">
              <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-extrabold text-sm flex items-center justify-center">
                1
              </span>
              <h3 className="font-bold text-slate-900 text-base">Report & Photograph</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Report what you lost or found. Add details, campus block, and photograph for automated visual feature embedding.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 relative">
              <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-extrabold text-sm flex items-center justify-center">
                2
              </span>
              <h3 className="font-bold text-slate-900 text-base">Match Discovery</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Use visual vector search or smart keyword filters. Potential matches generate automatic in-app alerts.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 relative">
              <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-extrabold text-sm flex items-center justify-center">
                3
              </span>
              <h3 className="font-bold text-slate-900 text-base">Recovery Request</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Send a recovery request. Mobile numbers stay strictly hidden until the recipient officially accepts.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 relative">
              <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-extrabold text-sm flex items-center justify-center">
                4
              </span>
              <h3 className="font-bold text-slate-900 text-base">Private Chat & Return</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Coordinate safe handoff via in-app chat. Both confirm return before recovery is completed.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Security & Confidentiality Architecture */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-navy-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-navy-800 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">Contact Confidentiality</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              University registration numbers and personal mobile numbers are never exposed in public listings. They are revealed only to the two verified participants of an accepted recovery.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-sky-600/30 border border-sky-500/50 flex items-center justify-center text-sky-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">Argon2id Hash Security</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Student and staff authentication uses state-of-the-art Argon2id password hashing, secure JWT tokens, and strict server-side authorization checks on every endpoint.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">Two-Party Return Confirmation</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              No item can be marked returned unilaterally. Both the finder and the owner must confirm handoff from their respective accounts before recovery is closed.
            </p>
          </div>

        </div>
      </section>

      {/* Student Services Information Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-900 to-navy-900 text-white rounded-3xl p-8 sm:p-10 border border-blue-700/50 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
              Campus Support Desk
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Need Help or In-Person Verification?
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Visit LPU Student Services at <span className="font-semibold text-white">Room 302, Block 32 (Division of Student Welfare)</span>. Our campus representatives can assist with password resets, official handoffs, and physical locker custody.
            </p>
          </div>

          <Link
            to="/services"
            className="px-6 py-3.5 bg-white text-navy-950 hover:bg-slate-100 font-bold text-sm rounded-xl shadow-md shrink-0 transition"
          >
            Student Services Directory
          </Link>
        </div>
      </section>

    </div>
  );
};
