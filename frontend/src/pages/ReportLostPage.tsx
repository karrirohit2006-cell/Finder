import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, AlertCircle, CheckCircle2, MapPin, Calendar, Clock, Tag, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import { ImageUploader } from '../components/ImageUploader';
import { useAuth } from '../context/AuthContext';

export const ReportLostPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [description, setDescription] = useState('');
  const [lostDate, setLostDate] = useState(new Date().toISOString().split('T')[0]);
  const [approxTime, setApproxTime] = useState('12:00 PM');
  const [location, setLocation] = useState('');
  const [colour, setColour] = useState('');
  const [brand, setBrand] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [imagePaths, setImagePaths] = useState<string[]>([]);
  const [embeddings, setEmbeddings] = useState<number[][]>([]);

  const [campusLocations, setCampusLocations] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    'Electronics', 'Mobile phones', 'Laptops', 'Chargers', 'Wallets', 'Bags', 'Books',
    'ID cards', 'Keys', 'Watches', 'Jewellery', 'Clothing', 'Water bottles',
    'Stationery', 'Sports equipment', 'Other'
  ];

  useEffect(() => {
    api.getCampusLocations().then(setCampusLocations).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!location) {
      setError('Please select or specify the campus location where the item was lost.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.createLostReport({
        item_name: itemName.trim(),
        category,
        description: description.trim(),
        lost_date: lostDate,
        approx_time: approxTime.trim(),
        location,
        colour: colour.trim(),
        brand: brand.trim() || undefined,
        additional_details: additionalDetails.trim() || undefined,
        image_paths: imagePaths,
        embeddings: embeddings
      });

      navigate(`/lost-items/${res.report_id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to submit lost report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Title */}
      <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 text-xs font-black uppercase tracking-wider border border-rose-200 dark:border-rose-900">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span>Lost Item Filing</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Report a Lost Belonging
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Provide as much detail as possible to help the campus community identify and return your item.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center space-x-2.5 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200/90 dark:border-slate-800/90 space-y-6">
        
        {/* Item Basic Details */}
        <div className="space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            1. Item Specifications
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Item Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. Dell Inspiron 15 Laptop, Blue Titan Watch"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs sm:text-sm font-semibold focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs sm:text-sm font-semibold focus:border-blue-500 outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Primary Colour <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={colour}
                onChange={(e) => setColour(e.target.value)}
                placeholder="e.g. Matte Black, Navy Blue, Silver"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs sm:text-sm font-semibold focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Brand / Manufacturer (Optional)
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Dell, Apple, Nike, Casio, Wildcraft"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs sm:text-sm font-semibold focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Description & Identifying Marks <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe scratches, keychains, stickers, case color, unique markings..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs sm:text-sm focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 outline-none leading-relaxed"
            />
          </div>
        </div>

        {/* Location & Time */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            2. Incident Location & Timing
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Campus Location <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:border-blue-500 outline-none"
              >
                <option value="">Select LPU Block...</option>
                {campusLocations.map((loc) => (
                  <option key={loc.id} value={loc.name}>{loc.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Date Lost <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={lostDate}
                onChange={(e) => setLostDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Approximate Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={approxTime}
                onChange={(e) => setApproxTime(e.target.value)}
                placeholder="e.g. 10:30 AM or Afternoon"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Photographs & Computer Vision Feature Extraction */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              3. Item Photographs (Recommended)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Uploading a reference photo computes a 128-dimensional perceptual feature vector to automatically discover matching found items.
            </p>
          </div>

          <ImageUploader
            onUploadComplete={(paths, embs) => {
              setImagePaths(paths);
              setEmbeddings(embs);
            }}
          />
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-rose-600/30 transition transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {isSubmitting ? 'Registering Lost Report & Vector...' : 'Submit Lost Item Report'}
          </button>
        </div>

      </form>

    </div>
  );
};
