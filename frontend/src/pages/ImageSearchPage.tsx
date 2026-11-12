import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Search, 
  Filter, 
  AlertCircle, 
  Info, 
  ArrowRight,
  ShieldAlert,
  Loader2,
  X,
  Sliders,
  Scan
} from 'lucide-react';
import { api } from '../services/api';
import { ItemCard } from '../components/ItemCard';
import { EmptyState } from '../components/EmptyState';

export const ImageSearchPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [targetType, setTargetType] = useState<'found' | 'lost'>('found');
  const [category, setCategory] = useState('All');
  const [location, setLocation] = useState('All');
  const [colour, setColour] = useState('');
  const [keyword, setKeyword] = useState('');
  const [minSimilarity, setMinSimilarity] = useState<number>(30);

  const [matches, setMatches] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [campusLocations, setCampusLocations] = useState<any[]>([]);

  const categories = [
    'All', 'Electronics', 'Mobile phones', 'Laptops', 'Chargers', 'Wallets', 'Bags', 'Books',
    'ID cards', 'Keys', 'Watches', 'Jewellery', 'Clothing', 'Water bottles',
    'Stationery', 'Sports equipment', 'Other'
  ];

  useEffect(() => {
    api.getCampusLocations().then(setCampusLocations).catch(() => {});
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Image size exceeds 10MB limit.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setHasSearched(true);

    const formData = new FormData();
    if (selectedFile) {
      formData.append('file', selectedFile);
    }
    formData.append('target_type', targetType);
    if (category !== 'All') formData.append('category', category);
    if (location !== 'All') formData.append('location', location);
    if (colour.trim()) formData.append('colour', colour.trim());
    if (keyword.trim()) formData.append('keyword', keyword.trim());
    formData.append('min_similarity', minSimilarity.toString());

    try {
      const results = await api.searchByImage(formData);
      setMatches(results);
    } catch (err: any) {
      alert(err.message || 'Image search failed.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      
      {/* Title */}
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300 text-xs font-extrabold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Computer Vision & Vector Similarity Search</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Find Visually Similar Belongings
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Upload a reference photograph of an item you lost or found. Our multi-channel computer vision model extracts 128-dimensional color, gradient, texture, and shape embeddings to rank potential matches.
        </p>
      </div>

      {/* Strict Ownership Disclaimer */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-3xl p-4 sm:p-5 text-xs text-amber-900 dark:text-amber-200 flex items-start space-x-3.5 shadow-sm">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold">Important Campus Verification Policy:</span>
          <p className="leading-relaxed text-amber-800 dark:text-amber-300 text-[11px] sm:text-xs">
            A possible visual image match provides similarity assistance only and <span className="font-bold underline">never automatically establishes ownership</span>. Ownership must be verified through the recovery request system and confirmed by both participants.
          </p>
        </div>
      </div>

      {/* Search Console */}
      <form onSubmit={handleSearch} className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800/90 shadow-xl space-y-8">
        
        {/* Step 1: Target Dataset & Image Upload */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left: Upload Reference Image */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              1. Reference Photograph
            </label>

            {previewUrl ? (
              <div className="relative aspect-video rounded-2xl border-2 border-blue-500 overflow-hidden bg-slate-100 dark:bg-slate-800 group shadow-md">
                <img src={previewUrl} alt="Query reference" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="absolute top-2.5 right-2.5 p-2 bg-slate-900/80 text-white rounded-full hover:bg-rose-600 transition shadow-md"
                  title="Remove reference photo"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2.5 left-2.5 bg-navy-950/90 text-white px-3 py-1 rounded-lg text-xs font-bold backdrop-blur-md flex items-center space-x-1.5 border border-blue-500/40">
                  <Scan className="w-3.5 h-3.5 text-blue-400" />
                  <span>Photo Ready for Embedding</span>
                </div>
              </div>
            ) : (
              <label className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50 dark:bg-slate-800/40 hover:bg-blue-50/30 dark:hover:bg-slate-800 transition duration-200 group">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950 group-hover:bg-blue-200 dark:group-hover:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 transition shadow-sm">
                  <Camera className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Click or drag photo to upload
                </span>
                <span className="text-[11px] text-slate-400 mt-1">JPEG, PNG, WebP up to 10MB</span>
              </label>
            )}

            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              {selectedFile ? 'Perceptual HSV, YCbCr & gradient feature vectors will be calculated on search.' : 'Optional: If no photo is available, the search falls back to keyword and metadata matching.'}
            </p>
          </div>

          {/* Right: Search Target & Filters */}
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                2. Target Catalog to Query
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTargetType('found')}
                  className={`py-3.5 px-4 rounded-2xl text-xs font-bold border transition text-left ${
                    targetType === 'found'
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-md ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="block font-black text-sm mb-0.5">Search Found Items</span>
                  <span className="block text-[11px] font-normal text-slate-500 dark:text-slate-400 leading-snug">
                    I lost an item; search what finders turned in
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetType('lost')}
                  className={`py-3.5 px-4 rounded-2xl text-xs font-bold border transition text-left ${
                    targetType === 'lost'
                      ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-800 dark:text-rose-300 shadow-md ring-2 ring-rose-500/20'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="block font-black text-sm mb-0.5">Search Lost Reports</span>
                  <span className="block text-[11px] font-normal text-slate-500 dark:text-slate-400 leading-snug">
                    I found an item; search who reported losing it
                  </span>
                </button>
              </div>
            </div>

            {/* Keyword fallback */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Keyword & Brand Query (Optional)
              </label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. Dell Inspiron, Blue bottle, Titan watch..."
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-medium focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 outline-none transition"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-medium outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Campus Location
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-medium outline-none truncate"
                >
                  <option value="All">All Locations</option>
                  {campusLocations.map((loc) => (
                    <option key={loc.id} value={loc.name}>{loc.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Similarity Sensitivity Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                <span>Minimum Match Sensitivity:</span>
                <span className="text-blue-600 dark:text-blue-400 font-mono">{minSimilarity}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                step="5"
                value={minSimilarity}
                onChange={(e) => setMinSimilarity(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
                <span>Broad (10%)</span>
                <span>Balanced (30%)</span>
                <span>Strict (80%)</span>
              </div>
            </div>

          </div>

        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={isSearching}
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl shadow-blue-600/30 transition transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Computing 128-D Vector Cosine Similarity...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>Compute Similarities & Find Matches</span>
              </>
            )}
          </button>
        </div>

      </form>

      {/* Results Section */}
      {hasSearched && (
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Similarity Results ({matches.length})
            </h2>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Ranked by multi-factor visual & metadata match
            </span>
          </div>

          {matches.length === 0 ? (
            <EmptyState
              title="No Visually Similar Belongings Found"
              description="No existing records crossed the similarity threshold. Try lowering the minimum match sensitivity slider or searching by general category."
              actionText="Reset Sensitivity to 20%"
              onAction={() => setMinSimilarity(20)}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {matches.map((item) => (
                <ItemCard key={item.id || item.report_id} item={item} type={targetType} />
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
