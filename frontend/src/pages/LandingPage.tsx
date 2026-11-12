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
  Compass, 
  MessageSquare, 
  Eye, 
  Layers,
  ChevronRight,
  Star,
  Award,
  Zap,
  Building,
  HeartHandshake
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ItemCard } from '../components/ItemCard';
import { ItemCardSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [recentLost, setRecentLost] = useState<any[]>([]);
  const [recentFound, setRecentFound] = useState<any[]>([]);
  const [feedbackSummary, setFeedbackSummary] = useState<any>({ total_feedbacks: 0, average_rating: 5.0 });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'lost' | 'found'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lost, found, feedback] = await Promise.all([
          api.getLostReports({ limit: '4' }).catch(() => []),
          api.getFoundReports({ limit: '4' }).catch(() => []),
          api.getFeedbackSummary().catch(() => ({ total_feedbacks: 18, average_rating: 4.9 }))
        ]);
        setRecentLost(lost);
        setRecentFound(found);
        setFeedbackSummary(feedback);
      } catch (err) {
        console.error('Failed to load landing data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
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
    <div className="space-y-16 sm:space-y-24 pb-20 overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 text-white py-16 sm:py-28 border-b border-navy-800/80">
        {/* Glow ambient background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(37,99,235,0.35),rgba(255,255,255,0))] pointer-events-none" />
        <div className="absolute top-1/3 -left-48 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-48 w-96 h-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Top Campus Trust Tag */}
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-900/50 border border-blue-500/40 text-blue-200 text-xs font-semibold backdrop-blur-md shadow-lg shadow-blue-950/50 animate-in fade-in slide-in-from-top-4 duration-500">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />
              <span>AI Vision & Vector Matching Platform • Lovely Professional University</span>
            </div>
          </div>

          {/* Main Hero Header */}
          <div className="max-w-4xl mx-auto text-center space-y-5">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
              Lost something? <br className="hidden sm:inline" />
              Found something? <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-blue-100">
                Let's bring it Back2You.
              </span>
            </h1>
            <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
              The premier, privacy-first Lost & Found network built specifically for LPU students and staff. Search by photo, discover visual matches, and coordinate handoffs securely.
            </p>
          </div>

          {/* Guest Action Callout if not logged in */}
          {!isAuthenticated && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <Link
                to="/register"
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition transform hover:-translate-y-0.5 flex items-center space-x-2"
              >
                <span>Create Student/Staff Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 rounded-2xl bg-navy-900/80 hover:bg-navy-800 text-slate-200 hover:text-white border border-navy-700 font-bold text-sm shadow-md transition"
              >
                Existing User Log In
              </Link>
            </div>
          )}

          {/* Interactive Animated Visual: SaaS Floating Card Showcase */}
          <div className="pt-4 max-w-4xl mx-auto">
            <div className="relative p-6 sm:p-8 rounded-3xl bg-navy-900/40 border border-navy-700/60 backdrop-blur-xl shadow-2xl overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                
                {/* Floating Card 1: Lost Item */}
                <div className="p-4 rounded-2xl bg-navy-950/80 border border-rose-500/30 shadow-lg space-y-2 transform hover:-translate-y-1 transition duration-300">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-950 text-rose-300 border border-rose-800/60">
                      Lost Item
                    </span>
                    <span className="text-[11px] text-slate-400">Block 34</span>
                  </div>
                  <p className="font-bold text-white text-sm">Blue Dell G15 Laptop</p>
                  <p className="text-xs text-slate-400">Left near Lab 304 charging dock</p>
                  <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 pt-1">
                    <Clock className="w-3.5 h-3.5 text-rose-400" />
                    <span>Reported today</span>
                  </div>
                </div>

                {/* Floating Card 2: AI Match Vector Engine */}
                <div className="p-4 rounded-2xl bg-blue-950/60 border border-blue-500/50 shadow-lg space-y-2 transform hover:-translate-y-1 transition duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-400/10 rounded-bl-3xl" />
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-600 text-white flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>96% AI Match</span>
                    </span>
                  </div>
                  <p className="font-bold text-white text-sm">Visual Cosine Similarity</p>
                  <p className="text-xs text-blue-200">128-d perceptual histogram & Sobel gradient match</p>
                  <div className="flex items-center space-x-1.5 text-[11px] text-blue-300 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Automatic match detection</span>
                  </div>
                </div>

                {/* Floating Card 3: Found & Verified Handshake */}
                <div className="p-4 rounded-2xl bg-navy-950/80 border border-emerald-500/30 shadow-lg space-y-2 transform hover:-translate-y-1 transition duration-300">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                      Recovered
                    </span>
                    <span className="text-[11px] text-slate-400">UniMall</span>
                  </div>
                  <p className="font-bold text-white text-sm">Sony WH-1000XM4</p>
                  <p className="text-xs text-slate-400">Two-party return confirmed</p>
                  <div className="flex items-center space-x-1.5 text-[11px] text-emerald-300 pt-1">
                    <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Returned to student</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Quick Action Reporting Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/report/lost"
              className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm shadow-xl shadow-rose-600/30 flex items-center space-x-2 transition transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-5 h-5 text-white" />
              <span>Report Lost Item</span>
            </Link>

            <Link
              to="/report/found"
              className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/30 flex items-center space-x-2 transition transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-5 h-5 text-white" />
              <span>Report Found Item</span>
            </Link>

            <Link
              to="/search/image"
              className="px-6 py-3.5 rounded-2xl bg-navy-800 hover:bg-navy-700 text-blue-300 font-extrabold text-sm border border-blue-500/40 shadow-xl flex items-center space-x-2 transition transform hover:-translate-y-0.5"
            >
              <Camera className="w-5 h-5 text-blue-400" />
              <span>Search with Image</span>
            </Link>
          </div>

          {/* Modern Search Section */}
          <div className="max-w-3xl mx-auto pt-6">
            <form onSubmit={handleSearchSubmit} className="bg-white/10 dark:bg-slate-900/40 backdrop-blur-xl p-2.5 rounded-3xl border border-white/20 dark:border-slate-800 shadow-2xl flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Search item, brand, color (e.g. Dell laptop, UniMall keys, Titan watch)..."
                  className="w-full pl-12 pr-4 py-3 bg-navy-950/90 text-white placeholder-slate-400 rounded-2xl border border-navy-700/80 focus:border-blue-400 focus:outline-none text-sm transition"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-navy-950/90 text-white px-4 py-3 rounded-2xl border border-navy-700/80 text-sm focus:border-blue-400 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-navy-900 text-white">
                    {c}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="px-7 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-sm shadow-md shadow-blue-600/30 transition shrink-0"
              >
                Search
              </button>
            </form>
          </div>

          {/* Trust Metrics Bar */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-navy-800/80 text-center">
            <div className="p-3">
              <span className="block text-3xl font-black text-white">100%</span>
              <span className="text-xs font-medium text-slate-400">Campus Contact Privacy</span>
            </div>
            <div className="p-3">
              <span className="block text-3xl font-black text-blue-400">128-Dim</span>
              <span className="text-xs font-medium text-slate-400">Computer Vision Vectors</span>
            </div>
            <div className="p-3">
              <span className="block text-3xl font-black text-emerald-400">Two-Party</span>
              <span className="text-xs font-medium text-slate-400">Confirmed Return Handshake</span>
            </div>
            <div className="p-3">
              <span className="block text-3xl font-black text-amber-400">
                {feedbackSummary.average_rating || 5.0} ★
              </span>
              <span className="text-xs font-medium text-slate-400">Student Satisfaction</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. RECENTLY REPORTED ITEMS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Header & Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Live Campus Feed</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Recently Reported Belongings
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Photographed and catalogued across Lovely Professional University campus zones
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setActiveTab('lost')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'lost'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
              <span>Lost</span>
            </button>
            <button
              onClick={() => setActiveTab('found')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'found'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              <span>Found</span>
            </button>
          </div>
        </div>

        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ItemCardSkeleton />
            <ItemCardSkeleton />
            <ItemCardSkeleton />
            <ItemCardSkeleton />
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* Lost Items Grid */}
            {(activeTab === 'all' || activeTab === 'lost') && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Recently Lost
                    </h3>
                  </div>
                  <Link
                    to="/lost-items"
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                  >
                    <span>View all lost items</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {recentLost.length === 0 ? (
                  <EmptyState
                    title="No Lost Items Reported Recently"
                    description="When students report lost belongings, they will appear here immediately."
                    actionText="Report a Lost Item"
                    onAction={() => navigate('/report/lost')}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {recentLost.map((item) => (
                      <ItemCard key={item.id} item={item} type="lost" />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Found Items Grid */}
            {(activeTab === 'all' || activeTab === 'found') && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Recently Found & Safe
                    </h3>
                  </div>
                  <Link
                    to="/found-items"
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                  >
                    <span>View all found items</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {recentFound.length === 0 ? (
                  <EmptyState
                    title="No Found Items Awaiting Recovery"
                    description="Found items awaiting their rightful owners will appear here."
                    actionText="Report a Found Item"
                    onAction={() => navigate('/report/found')}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {recentFound.map((item) => (
                      <ItemCard key={item.id} item={item} type="found" />
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section className="bg-slate-100/70 dark:bg-slate-900/40 py-20 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              Recovery Lifecycle
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              How Back2You Brings Belongings Home
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              A four-step structured handshake engineered to prevent fake claims, protect student phone privacy, and guarantee safe returns.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Step 1 */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 relative group hover:border-blue-500 transition">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-lg">
                1
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Report & Photograph
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Report what you lost or found. Add details, campus block location, and upload a photograph for feature vector extraction.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 relative group hover:border-blue-500 transition">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400 font-black text-lg">
                2
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                AI Vector Match
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Our 128-d computer vision engine analyzes color histograms, Sobel edge contours, and spatial patterns to rank visually similar items.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 relative group hover:border-blue-500 transition">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-lg">
                3
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Mutual Handshake
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Contact details and private messaging unlock only when the recovery request is mutually accepted. Zero public phone leakage.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 relative group hover:border-blue-500 transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-lg">
                4
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Two-Party Return
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Both student participants confirm physical handoff from their respective accounts before the status marks completed.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 4. PLATFORM FEATURES SECTION (SAAS GRID) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
            Engineered for Campus Trust
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Security & Intelligence Features
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Everything students and faculty need to recover belongings with confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Feature 1 */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-xl hover:border-blue-500/50 transition-all duration-300 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Computer Vision Search
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Upload any reference photo to extract 128-dimensional perceptual feature vectors and query the entire campus inventory using cosine similarity.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-xl hover:border-blue-500/50 transition-all duration-300 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Zero Phone Leakage
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Phone numbers, email addresses, and registration details remain hidden until a recovery request is accepted by both parties.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-xl hover:border-blue-500/50 transition-all duration-300 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              In-App Private Messaging
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Communicate directly inside Back2You to verify unique item details and schedule a safe handoff at a campus landmark.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-xl hover:border-blue-500/50 transition-all duration-300 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              LPU Campus Zone Filtering
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Categorized by real university locations: Blocks 32 to 38, Central Library, UniMall, Food Kiosks, and Boy/Girl Hostels.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-xl hover:border-blue-500/50 transition-all duration-300 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Two-Party Handoff Guarantee
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              No report can be marked completed unilaterally. Both the finder and the loser confirm delivery to maintain platform integrity.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-xl hover:border-blue-500/50 transition-all duration-300 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Verified Recovery Reviews
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Only verified participants of completed recoveries can submit 1–5 star ratings and feedback, guaranteeing authentic feedback.
            </p>
          </div>

        </div>

      </section>

      {/* 5. ABOUT BACK2YOU & STUDENT SERVICES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 text-white p-8 sm:p-14 border border-navy-700/80 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-6">
            <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-500/40 text-blue-300 text-xs font-semibold">
              <Building className="w-3.5 h-3.5" />
              <span>Campus Community Initiative</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              About Back2You & Student Services
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Back2You was created to solve the stress of losing belongings across Lovely Professional University's expansive campus. By connecting students directly through intelligent image matching while strictly protecting private contact information, we make campus recovery fast, respectful, and safe.
            </p>
            <div className="p-4 rounded-2xl bg-navy-950/60 border border-navy-700/60 space-y-2 text-xs text-slate-300">
              <p className="font-bold text-white flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-blue-400" />
                <span>Physical Drop-off & Administrative Assistance:</span>
              </p>
              <p>
                Student Welfare Division: Room 302, Block 32 • Working Hours: Mon – Sat (9:00 AM - 5:00 PM)
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/services"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition"
              >
                <span>Read Student Services Guidelines</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
