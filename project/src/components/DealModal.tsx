import { ExternalLink, MapPin, Tag, Sparkles, Crown } from 'lucide-react';
import type { Discount } from '@/types';

interface DealModalProps {
  deal: Discount;
  isSaved: boolean;
  isUsed: boolean;
  showUsedToggle?: boolean;
  showSaveToggle?: boolean;
  onSave?: () => void;
  onToggleUsed?: () => void;
  onClose: () => void;
}

export function DealModal({
  deal,
  isSaved,
  isUsed,
  showUsedToggle = false,
  showSaveToggle = true,
  onSave,
  onToggleUsed,
  onClose,
}: DealModalProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div className="relative h-32 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-t-2xl overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 right-8 w-24 h-24 bg-white rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-12 w-32 h-32 bg-white rounded-full blur-3xl" />
          </div>
          <div className="absolute top-4 left-4 flex gap-2">
            {deal.is_starving_student && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 text-teal-700">
                <Crown className="w-3 h-3" /> Student Card
              </span>
            )}
            {deal.is_new && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-400 text-amber-900">
                New
              </span>
            )}
            {deal.is_ai && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-400 text-violet-900">
                <Sparkles className="w-3 h-3" /> AI
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <div className="text-sm font-medium text-teal-600 mb-1">{deal.company}</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{deal.title}</h2>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 text-teal-700 font-bold text-lg mb-4">
            <Tag className="w-4 h-4" />
            {deal.discount_value}
          </div>

          <p className="text-gray-600 text-sm leading-relaxed mb-5">{deal.description}</p>

          <div className="space-y-3 mb-5">
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Category</div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm capitalize">
                {deal.category}
              </span>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">How to Access</div>
              <p className="text-sm text-gray-700 leading-relaxed">{deal.access_instructions}</p>
            </div>
            {deal.location_name && (
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Location</div>
                <p className="text-sm text-gray-700 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-teal-500" />
                  {deal.location_name}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <a
              href={deal.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-teal-500/30 transition-all"
            >
              Visit Website <ExternalLink className="w-4 h-4" />
            </a>
            {showSaveToggle && (
              <button
                onClick={onSave}
                className={`px-4 py-3 rounded-xl font-semibold text-sm border-2 transition-all ${
                  isSaved
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-200 text-gray-600 hover:border-teal-300'
                }`}
              >
                {isSaved ? 'Saved' : 'Save'}
              </button>
            )}
            {showUsedToggle && (
              <button
                onClick={onToggleUsed}
                className={`px-4 py-3 rounded-xl font-semibold text-sm border-2 transition-all ${
                  isUsed
                    ? 'border-gray-300 bg-gray-100 text-gray-500'
                    : 'border-emerald-400 text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                {isUsed ? 'Used' : 'Mark Used'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
