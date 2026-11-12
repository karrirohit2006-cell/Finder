import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Tag, Sparkles, CheckCircle2, ArrowRight, Clock, ShieldCheck, Eye } from 'lucide-react';

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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const itemType = type || item.report_type || (item.report_id.startsWith('LOST') ? 'lost' : 'found');
  
  // Resolve image URL
  let imageUrl = '';
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

  const renderStatusBadge = () => {
    const status = (item.status || 'active').toLowerCase();

    if (status === 'resolved' || status === 'returned' || status === 'completed') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500 text-white shadow-sm backdrop-blur-md">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Recovered</span>
        </span>
      );
    }

    if (status === 'match_found' || status === 'matched') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-600 text-white shadow-sm backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>Matched</span>
        </span>
      );
    }

    if (status === 'recovery_pending' || status === 'pending') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-sm backdrop-blur-md">
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Handshake</span>
        </span>
      );
    }

    if (status === 'withdrawn') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-600 text-white shadow-sm">
          <span>Withdrawn</span>
        </span>
      );
    }

    // Default active badge by type
    return (
      <span
        className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider shadow-md backdrop-blur-md ${
          itemType === 'lost'
            ? 'bg-rose-600 text-white'
            : 'bg-emerald-600 text-white'
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        <span>{itemType === 'lost' ? 'Lost Item' : 'Found Item'}</span>
      </span>
    );
  };

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 dark:hover:shadow-blue-900/10 hover:border-blue-400/50 dark:hover:border-blue-500/40 transition-all duration-300 flex flex-col overflow-hidden">
      
      {/* Top Image Box */}
      <div className="relative aspect-[16/10] w-full bg-slate-100 dark:bg-slate-800/60 overflow-hidden">
        {imageUrl && !imageError ? (
          <>
            <img
              src={imageUrl}
              alt={item.item_name}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 skeleton-shimmer" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-800 text-slate-400 p-4">
            <div className="w-12 h-12 rounded-2xl bg-white/80 dark:bg-slate-800/80 shadow-sm flex items-center justify-center mb-2">
              <Tag className="w-6 h-6 text-slate-400 dark:text-slate-500" />
            </div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              No Photo Uploaded
            </span>
          </div>
        )}

        {/* Top Floating Status Badge */}
        <div className="absolute top-3 left-3 z-10">
          {renderStatusBadge()}
        </div>

        {/* AI Similarity Match Pill */}
        {item.similarity_score !== undefined && (
          <div className="absolute top-3 right-3 z-10 bg-navy-950/90 dark:bg-blue-950/90 text-white backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center space-x-1 shadow-lg border border-blue-400/50">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{Math.round(item.similarity_score)}% Match</span>
          </div>
        )}

        {/* Quick View Overlay on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white text-xs font-bold shadow-lg backdrop-blur-md transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>View Details</span>
          </span>
        </div>
      </div>

      {/* Item Information Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Category & Report ID Tag */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200/50 dark:border-blue-800/50">
              {item.report_id}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
              {item.category}
            </span>
          </div>

          {/* Item Name */}
          <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
            {item.item_name}
          </h3>

          {/* Description preview */}
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {item.description || 'No additional identifying description recorded.'}
          </p>
        </div>

        {/* Meta details footer */}
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center text-slate-600 dark:text-slate-300 truncate font-medium">
              <MapPin className="w-3.5 h-3.5 mr-1.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="truncate">{item.location}</span>
            </div>
            {item.colour && (
              <span className="shrink-0 text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                {item.colour}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 text-[11px]">
            <div className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400 dark:text-slate-500 shrink-0" />
              <span>{formattedDate}</span>
            </div>
            {item.brand && (
              <span className="truncate max-w-[110px] font-medium text-slate-500 dark:text-slate-400">
                Brand: {item.brand}
              </span>
            )}
          </div>

          {/* Action Link Button */}
          <Link
            to={detailPath}
            className="w-full flex items-center justify-center space-x-1.5 py-2.5 px-4 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white border border-blue-200/60 dark:border-blue-900/50 shadow-sm transition-all duration-200 group/btn"
          >
            <span>View Details & Recovery</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
