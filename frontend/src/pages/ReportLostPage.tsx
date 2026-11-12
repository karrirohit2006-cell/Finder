import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, AlertCircle, CheckCircle2, MapPin, Calendar, Clock, Tag } from 'lucide-react';
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div className="space-y-2 border-b border-slate-200 pb-5">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider">
          <span>Lost Item Report</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Report a Lost Belonging
        </h1>
        <p className="text-sm text-slate-500">
          Provide as much detail as possible to help the campus community identify and return your item.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
        
        {/* Item Basic Details */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">1. Item Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Item Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. Blue HP Pavilion Laptop"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Colour <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={colour}
                onChange={(e) => setColour(e.target.value)}
                placeholder="e.g. Navy Blue, Silver, Matte Black"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Brand / Manufacturer (optional)
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Apple, Dell, Titan, Wildcraft"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe distinguishing marks, stickers, case color, model details..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Date & Location */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-base font-bold text-slate-900">2. Where & When was it Lost?</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date Lost <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={lostDate}
                onChange={(e) => setLostDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Approximate Time <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={approxTime}
                onChange={(e) => setApproxTime(e.target.value)}
                placeholder="e.g. Around 2:30 PM, Morning recess"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Campus Location <span className="text-red-500">*</span>
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none"
            >
              <option value="">Select an LPU Campus Location...</option>
              {campusLocations.map((loc) => (
                <option key={loc.id} value={loc.name}>
                  {loc.category} — {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Additional Identifying Details (optional)
            </label>
            <input
              type="text"
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              placeholder="e.g. Specific wallpaper, serial number prefix, keychain initials"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Photographs */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-base font-bold text-slate-900">3. Photographs (Optional)</h2>
          <p className="text-xs text-slate-500">
            Upload photographs of the item or similar reference photos. Visual features are extracted automatically to assist AI similarity matching.
          </p>
          <ImageUploader
            onImagesChange={(paths, embs) => {
              setImagePaths(paths);
              setEmbeddings(embs || []);
            }}
            maxFiles={3}
            required={false}
          />
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-sm shadow-md shadow-red-600/30 transition transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {isSubmitting ? 'Publishing Report...' : 'Publish Lost Item Report'}
          </button>
        </div>

      </form>
    </div>
  );
};
