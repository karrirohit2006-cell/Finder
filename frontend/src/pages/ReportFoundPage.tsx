import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, AlertCircle, CheckCircle2, MapPin, Calendar, Clock, Camera } from 'lucide-react';
import { api } from '../services/api';
import { ImageUploader } from '../components/ImageUploader';

export const ReportFoundPage: React.FC = () => {
  const navigate = useNavigate();

  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [description, setDescription] = useState('');
  const [foundDate, setFoundDate] = useState(new Date().toISOString().split('T')[0]);
  const [approxTime, setApproxTime] = useState('1:00 PM');
  const [location, setLocation] = useState('');
  const [colour, setColour] = useState('');
  const [brand, setBrand] = useState('');
  const [additionalObservations, setAdditionalObservations] = useState('');
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

    if (imagePaths.length === 0) {
      setError('A photograph of the found item is required to facilitate visual matching and rightful ownership verification.');
      return;
    }

    if (!location) {
      setError('Please select the campus location where you discovered the item.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.createFoundReport({
        item_name: itemName.trim(),
        category,
        description: description.trim(),
        found_date: foundDate,
        approx_time: approxTime.trim(),
        location,
        colour: colour.trim(),
        brand: brand.trim() || undefined,
        additional_observations: additionalObservations.trim() || undefined,
        image_paths: imagePaths,
        embeddings: embeddings
      });

      navigate(`/found-items/${res.report_id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to submit found report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div className="space-y-2 border-b border-slate-200 pb-5">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          <span>Found Item Report</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Report a Found Belonging
        </h1>
        <p className="text-sm text-slate-500">
          Help reunite an item with its owner. Photographs are required for visual verification.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
        
        {/* Photographs — Essential Feature */}
        <div className="space-y-3 p-5 bg-blue-50/50 rounded-2xl border border-blue-200">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Item Photograph <span className="text-red-500">* (Essential)</span>
            </h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Please capture clear photos of the item. Visual feature embeddings will be computed automatically and compared with active lost reports to notify potential owners immediately.
          </p>
          <ImageUploader
            onImagesChange={(paths, embs) => {
              setImagePaths(paths);
              setEmbeddings(embs || []);
            }}
            maxFiles={4}
            required={true}
          />
        </div>

        {/* Item Basic Details */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">Item Information</h2>

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
                placeholder="e.g. Wireless Mouse, Black Fastrack Watch"
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
                placeholder="e.g. Black, White, Red"
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
                placeholder="e.g. Logitech, Boat, Mi, Casio"
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
              placeholder="State key visible features, conditions, where it was spotted..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Date & Location */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Location & Time Found</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date Found <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={foundDate}
                onChange={(e) => setFoundDate(e.target.value)}
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
                placeholder="e.g. Around 1:15 PM"
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
              Additional Observations (optional)
            </label>
            <input
              type="text"
              value={additionalObservations}
              onChange={(e) => setAdditionalObservations(e.target.value)}
              placeholder="e.g. Currently kept with Block 34 security desk or with me"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/30 transition transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {isSubmitting ? 'Processing & Finding Matches...' : 'Publish Found Item Report'}
          </button>
        </div>

      </form>
    </div>
  );
};
