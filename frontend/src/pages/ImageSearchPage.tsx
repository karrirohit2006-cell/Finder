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
  X
} from 'lucide-react';
import { api } from '../services/api';
import { ItemCard } from '../components/ItemCard';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title */}
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Computer Vision & Vector Similarity Search</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Find Visually Similar Belongings
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Upload a reference photograph of an item you lost or found. Our multi-channel computer vision model extracts 128-dimensional color, gradient, texture, and shape embeddings to rank potential matches.
        </p>
      </div>

      {/* Strict Ownership Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start space-x-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold">Important University Disclaimer:</span>
          <p className="leading-relaxed">
            A possible visual image match provides similarity assistance only and <span className="font-semibold underline">never automatically establishes ownership</span>. Ownership must be verified through the recovery request system and confirmed by both participants.
          </p>
        </div>
      </div>

      {/* Search Console */}
      <form onSubmit={handleSearch} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        
        {/* Step 1: Target Dataset & Image Upload */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left: Upload Reference Image */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. Reference Photograph
            </label>

            {previewUrl ? (
              <div className="relative aspect-video rounded-2xl border-2 border-blue-500 overflow-hidden bg-slate-100 group">
                <img src={previewUrl} alt="Query reference" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="absolute top-2 right-2 p-1.5 bg-slate-900/80 text-white rounded-full hover:bg-red-600 transition"
                  title="Remove reference photo"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 bg-navy-950/80 text-white px-2 py-0.5 rounded text-[11px] font-semibold">
                  Photo Loaded for Feature Extraction
                </div>
              </div>
            ) : (
              <label className="relative border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50 hover:bg-blue-50/20 transition duration-200 group">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-12 h-12 rounded-2xl bg-blue-100 group-hover:bg-blue-200 text-blue-600 flex items-center justify-center mb-2 transition">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-700">Click to upload reference photo</span>
                <span className="text-[11px] text-slate-400 mt-0.5">JPEG, PNG, WebP up to 10MB</span>
              </label>
            )}

            <p className="text-[11px] text-slate-400">
              {selectedFile ? 'Image feature vector will be calculated on submission.' : 'Optional: If no photo is available, the search falls back to keyword and metadata matching.'}
            </p>
          </div>

          {/* Right: Search Target & Filters */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                2. Where do you want to search?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTargetType('found')}
                  className={`py-3 px-4 rounded-xl text-xs font-bold border transition ${
                    targetType === 'found'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Search Found Items
                  <span className="block text-[10px] font-normal text-slate-500 mt-0.5">I lost something, search what was found</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetType('lost')}
                  className={`py-3 px-4 rounded-xl text-xs font-bold border transition ${
                    targetType === 'lost'
                      ? 'bg-red-50 border-red-500 text-red-800 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Search Lost Reports
                  <span className="block text-[10px] font-normal text-slate-500 mt-0.5">I found something, search who lost it</span>
                </button>
              </div>
            </div>

            {/* Keyword fallback */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Optional Keyword or Brand
              </label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. Dell, Casio, Wildcraft, Black wallet..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category Filter
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:border-blue-500 outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Colour Filter
                </label>
                <input
                  type="text"
                  value={colour}
                  onChange={(e) => setColour(e.target.value)}
                  placeholder="e.g. Blue, Red, Silver"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>
            </div>

          </div>

        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Cosine vector similarity threshold: <span className="font-semibold text-blue-600">{minSimilarity}%</span>
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-600/30 flex items-center space-x-2 transition disabled:opacity-50"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Computing Visual Similarity...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Compute Similar Matches</span>
              </>
            )}
          </button>
        </div>

      </form>

      {/* Results Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <span>Visual & Metadata Matches</span>
            {hasSearched && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                {matches.length} found
              </span>
            )}
          </h2>
        </div>

        {isSearching ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Extracting image embeddings and ranking similarity...</p>
            <p className="text-xs text-slate-400">Comparing color histograms, edge gradients, and spatial layout vectors</p>
          </div>
        ) : hasSearched && matches.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <Camera className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No matching items found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No reports in the database exceeded the similarity threshold. Try broadening your category or location filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {matches.map((item) => (
              <ItemCard key={item.report_id} item={item} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
