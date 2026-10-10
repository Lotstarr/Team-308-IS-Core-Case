import { useEffect, useState, useMemo } from 'react';
import {
  Crown,
  Search,
  Check,
  Bookmark,
  BookmarkCheck,
  Map as MapIcon,
  Filter,
  X,
  ChevronDown,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNav } from '@/context/NavContext';
import { useAuth } from '@/context/AuthContext';
import { useSavedItems } from '@/hooks/useSavedItems';
import type { Discount } from '@/types';
import { DealModal } from '@/components/DealModal';

type SortMode = 'default' | 'company' | 'type' | 'free' | 'discount';

export function StarvingStudentHubPage() {
  const { navigate } = useNav();
  const { profile } = useAuth();
  const { usedDealIds, toggleUsedDeal, savedDiscountIds, toggleSaveDiscount } = useSavedItems();
  const [deals, setDeals] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState<Discount | null>(null);
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('default');
  const [showUsed, setShowUsed] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('discounts')
        .select('*')
        .eq('is_starving_student', true)
        .order('created_at', { ascending: false });
      setDeals((data as Discount[]) || []);
      setLoading(false);
    })();
  }, []);

  const sortedDeals = useMemo(() => {
    let result = deals.filter((d) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!d.title.toLowerCase().includes(q) && !d.company.toLowerCase().includes(q) && !d.description.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (!showUsed && usedDealIds.has(d.id)) return false;
      return true;
    });

    switch (sortMode) {
      case 'company':
        result.sort((a, b) => a.company.localeCompare(b.company));
        break;
      case 'type':
        result.sort((a, b) => a.discount_type.localeCompare(b.discount_type));
        break;
      case 'free':
        result.sort((a, b) => {
          const aFree = a.discount_type === 'free' ? 0 : 1;
          const bFree = b.discount_type === 'free' ? 0 : 1;
          return aFree - bFree;
        });
        break;
      case 'discount':
        result.sort((a, b) => {
          const aPct = a.discount_type === 'percentage' ? 0 : 1;
          const bPct = b.discount_type === 'percentage' ? 0 : 1;
          return aPct - bPct;
        });
        break;
      default:
        break;
    }

    // Always push used deals to bottom (unless showUsed)
    result.sort((a, b) => {
      const aUsed = usedDealIds.has(a.id) ? 1 : 0;
      const bUsed = usedDealIds.has(b.id) ? 1 : 0;
      return aUsed - bUsed;
    });

    return result;
  }, [deals, search, sortMode, showUsed, usedDealIds]);

  const usedCount = deals.filter((d) => usedDealIds.has(d.id)).length;
  const availableCount = deals.length - usedCount;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Card Hub</h1>
            <p className="text-gray-500">Track your Starving Student Card deals and mark them as used.</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Your Card Progress</span>
            <span className="text-sm text-gray-500">{usedCount} of {deals.length} used</span>
          </div>
          <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full transition-all duration-500"
              style={{ width: `${deals.length > 0 ? (usedCount / deals.length) * 100 : 0}%` }}
            />
          </div>
          <div className="flex gap-4 mt-3 text-sm">
            <span className="text-emerald-600 font-semibold">{availableCount} available</span>
            <span className="text-gray-400">{usedCount} used</span>
          </div>
        </div>

        {/* Search + sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search Starving Student deals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all"
          >
            <Filter className="w-4 h-4" /> Sort & Filter
          </button>
          <button
            onClick={() => navigate('map')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all"
          >
            <MapIcon className="w-4 h-4" /> Map
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6 animate-in slide-in-from-top-2 duration-200">
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Sort By</label>
              <div className="flex flex-wrap gap-2">
                {([
                  { id: 'default', label: 'Default' },
                  { id: 'company', label: 'Company' },
                  { id: 'type', label: 'Deal Type' },
                  { id: 'free', label: 'Free First' },
                  { id: 'discount', label: 'Discounts First' },
                ] as { id: SortMode; label: string }[]).map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSortMode(opt.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      sortMode === opt.id ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showUsed}
                  onChange={(e) => setShowUsed(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400"
                />
                Show used deals
              </label>
            </div>
          </div>
        )}

        {/* Deal list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
                <div className="flex gap-4">
                  <div className="h-14 w-14 rounded-xl bg-gray-200" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedDeals.length === 0 ? (
          <div className="text-center py-16">
            <Crown className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {search ? 'No deals found matching your search.' : 'No deals available.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedDeals.map((deal) => {
              const isUsed = usedDealIds.has(deal.id);
              return (
                <div
                  key={deal.id}
                  className={`group flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border transition-all duration-300 ${
                    isUsed ? 'opacity-50 border-gray-100' : 'border-gray-100 hover:shadow-md cursor-pointer'
                  }`}
                  onClick={() => !isUsed && setSelectedDeal(deal)}
                >
                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${
                      isUsed ? 'bg-gray-200' : 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-md'
                    }`}
                  >
                    {isUsed ? (
                      <Check className="w-7 h-7 text-gray-400" />
                    ) : (
                      <Crown className="w-7 h-7 text-white" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs text-gray-400 font-medium">{deal.company}</span>
                      {isUsed && (
                        <span className="text-xs text-gray-400 font-semibold bg-gray-100 px-2 py-0.5 rounded-full">Used</span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm truncate">{deal.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${
                        isUsed ? 'bg-gray-100 text-gray-400' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {deal.discount_value}
                      </span>
                      <span className="text-xs text-gray-400 capitalize">{deal.discount_type}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {profile && !isUsed && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveDiscount(deal.id);
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          savedDiscountIds.has(deal.id) ? 'text-teal-600 bg-teal-50' : 'text-gray-400 hover:text-teal-600 hover:bg-gray-50'
                        }`}
                        title={savedDiscountIds.has(deal.id) ? 'Saved' : 'Save to Hub'}
                      >
                        {savedDiscountIds.has(deal.id) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                      </button>
                    )}
                    {profile && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleUsedDeal(deal.id);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                          isUsed
                            ? 'border-gray-200 text-gray-500 hover:border-gray-300'
                            : 'border-emerald-400 text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {isUsed ? 'Undo' : 'Mark Used'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedDeal && (
        <DealModal
          deal={selectedDeal}
          isSaved={savedDiscountIds.has(selectedDeal.id)}
          isUsed={usedDealIds.has(selectedDeal.id)}
          showUsedToggle={!!profile}
          showSaveToggle={!!profile}
          onSave={() => toggleSaveDiscount(selectedDeal.id)}
          onToggleUsed={() => toggleUsedDeal(selectedDeal.id)}
          onClose={() => setSelectedDeal(null)}
        />
      )}
    </div>
  );
}
