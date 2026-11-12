import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Tag, Sparkles, CheckCircle2 } from 'lucide-react';

interface ItemCardProps {
  item: {
    id?: number;
    item_id?: number;
    report_id: string;
    report_type?: 'lost' | 'found';
    item_name: string;
    category: string;
    location: string;
    date?: string;
    lost_date?: string;
    found_date?: string;
    colour?: string;
    brand?: string;
    description?: string;
    status?: string;
    images?: Array<{ file_path: string }>;
    photograph?: string;
    similarity_score?: number;
    visual_similarity?: number;
  };
  type?: 'lost' | 'found';
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, type }) => {
  const itemType = type || item.report_type || (item.report_id.startsWith('LOST') ? 'lost' : 'found');
  
  // Resolve image URL
  let imageUrl = '/placeholder-item.svg';
  if (item.photograph) {
    imageUrl = item.photograph;
  } else if (item.images && item.images.length > 0) {
    imageUrl = item.images[0].file_path;
  }

  const rawDate = item.date || item.lost_date || item.found_date;
  const formattedDate = rawDate
    ? new Date(rawDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Recent';

  const detailPath = `/${itemType}-items/${item.report_id}`;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition duration-200 border border-slate-200 overflow-hidden flex flex-col group">
      {/* Image Preview & Badges */}
      <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
        {imageUrl.startsWith('/api') ? (
          <img
            src={imageUrl}
            alt={item.item_name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=500&auto=format&fit=crop&q=60';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 p-4">
            <Tag className="w-8 h-8 mb-1 text-slate-300" />
            <span className="text-[11px] font-medium text-slate-500">No Photo Available</span>
          </div>
        )}

        {/* Type Badge */}
        <div className="absolute top-2.5 left-2.5">
          <span
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider shadow-sm ${
              itemType === 'lost'
                ? 'bg-red-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {itemType === 'lost' ? 'Lost' : 'Found'}
          </span>
        </div>

        {/* Similarity Score Pill if present (e.g. Image Search) */}
        {item.similarity_score !== undefined && (
          <div className="absolute top-2.5 right-2.5 bg-blue-900/90 text-white backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-bold flex items-center space-x-1 shadow-md border border-blue-400/40">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>{item.similarity_score}% Match</span>
          </div>
        )}

        {/* Status Badge */}
        {item.status && item.status !== 'active' && (
          <div className="absolute bottom-2.5 right-2.5 bg-slate-900/80 backdrop-blur-sm text-slate-200 text-[10px] font-semibold px-2 py-0.5 rounded capitalize">
            {item.status.replace('_', ' ')}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span className="font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-medium">
              {item.report_id}
            </span>
            <span className="text-slate-600 font-medium">{item.category}</span>
          </div>

          <h3 className="font-semibold text-slate-900 text-base line-clamp-1 group-hover:text-blue-600 transition">
            {item.item_name}
          </h3>

          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {item.description || 'No detailed description provided.'}
          </p>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center text-xs text-slate-600 truncate">
            <MapPin className="w-3.5 h-3.5 mr-1.5 text-blue-600 shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
              <span>{formattedDate}</span>
            </div>
            {item.colour && (
              <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                {item.colour}
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <Link
          to={detailPath}
          className="w-full mt-2 text-center py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
        >
          View Details & Contact
        </Link>
      </div>
    </div>
  );
};
