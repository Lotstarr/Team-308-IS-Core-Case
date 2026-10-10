import { useEffect, useState, useMemo } from 'react';
import { Search, Tag, Bookmark, BookmarkCheck, Sparkles, Crown, Filter, X, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNav } from '@/context/NavContext';
import { useAuth } from '@/context/AuthContext';
import { useSavedItems } from '@/hooks/useSavedItems';
import type { Discount } from '@/types';
import { DealModal } from '@/components/DealModal';

const categories = ['all', 'food', 'tech', 'subscription', 'clothing', 'entertainment', 'services'];
const sortOptions = ['newest', 'company', 'type', 'category'] as const;

export function DiscountDashboardPage() {
  const { navigate, searchQuery } = useNav();
  const { profile } = useAuth();
  const { savedDiscountIds, toggleSaveDiscount } = useSavedItems();
  const [deals, setDeals] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState<Discount | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState<(typeof sortOptions)[number]>('newest');
  const [localSearch, setLocalSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const search = searchQuery || localSearch;

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('discounts').select('*').order('created_at', { ascending: false });
      setDeals((data as Discount[]) || []);
      setLoading(false);
    })();
  }, []);

  const filteredDeals = useMemo(() => {
    let result = [...deals];

    if (activeCategory !== 'all') {
      result = result.filter((d) => d.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.company.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q)
      );
    }

    if (showSavedOnly && profile) {
      result = result.filter((d) => savedDiscountIds.has(d.id));
    }

    switch (sortBy) {
      case 'company':
        result.sort((a, b) => a.company.localeCompare(b.company));
        break;
      case 'type':
        result.sort((a, b) => a.discount_type.localeCompare(b.discount_type));
        break;
      case 'category':
        result.sort((a, b) => a.category.localeCompare(b.category));
        break;
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return result;
  }, [deals, activeCategory, search, sortBy, showSavedOnly, profile, savedDiscountIds]);

  const cardGradients: Record<string, string> = {
    food: 'from-orange-400 to-red-500',
    tech: 'from-blue-400 to-cyan-500',
    subscription: 'from-teal-400 to-emerald-500',
    clothing: 'from-pink-400 to-rose-500',
    entertainment: 'from-amber-400 to-orange-500',
    services: 'from-gray-400 to-slate-500',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Discount Dashboard</h1>
          <p className="text-gray-500">Browse, filter, and save student discounts that interest you.</p>
        </div>

        {/* Search + filters bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by company, deal name, or category..."
              value={search}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all"
          >
            <Filter className="w-4 h-4" /> Filters
          </button>
          {profile && (
            <button
              onClick={() => setShowSavedOnly(!showSavedOnly)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                showSavedOnly
                  ? 'bg-teal-50 border-teal-400 text-teal-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {showSavedOnly ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              Saved Only
            </button>
          )}
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6 animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                        activeCategory === cat
                          ? 'bg-teal-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Sort By</label>
                <div className="flex flex-wrap gap-2">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSortBy(opt)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                        sortBy === opt
                          ? 'bg-teal-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {(activeCategory !== 'all' || sortBy !== 'newest' || showSavedOnly) && (
              <button
                onClick={() => {
                  setActiveCategory('all');
                  setSortBy('newest');
                  setShowSavedOnly(false);
                }}
                className="mt-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
              >
                <X className="w-3.5 h-3.5" /> Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Active filter chips */}
        {!showFilters && activeCategory !== 'all' && (
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-sm text-gray-500">Filtered by:</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-medium capitalize">
              {activeCategory}
              <button onClick={() => setActiveCategory('all')}><X className="w-3 h-3" /></button>
            </span>
          </div>
        )}

        {/* Results count */}
        <div className="text-sm text-gray-500 mb-4">{filteredDeals.length} deals found</div>

        {/* Deal grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
                <div className="h-12 w-12 rounded-xl bg-gray-200 mb-3" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="text-center py-16">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">No deals found matching your filters.</p>
            <button
              onClick={() => {
                setActiveCategory('all');
                setLocalSearch('');
                setShowSavedOnly(false);
              }}
              className="text-teal-600 font-semibold text-sm hover:text-teal-700"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDeals.map((deal) => {
              const isSaved = savedDiscountIds.has(deal.id);
              const gradient = cardGradients[deal.category] || 'from-teal-400 to-emerald-500';
              return (
                <div
                  key={deal.id}
                  className="group bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 cursor-pointer relative"
                  onClick={() => setSelectedDeal(deal)}
                >
                  {/* Badges */}
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    {deal.is_new && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">New</span>
                    )}
                    {deal.is_ai && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold bg-violet-100 text-violet-700">
                        <Sparkles className="w-3 h-3" /> AI
                      </span>
                    )}
                    {deal.is_subscription && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Sub</span>
                    )}
                  </div>

                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-md`}>
                    <Tag className="w-6 h-6 text-white" />
                  </div>

                  <div className="text-xs text-gray-400 font-medium mb-1">{deal.company}</div>
                  <h3 className="font-bold text-gray-900 text-sm mb-2 leading-snug">{deal.title}</h3>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 text-xs font-bold mb-3">
                    {deal.discount_value}
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">{deal.description}</p>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <span className="text-xs text-gray-400 capitalize">{deal.category}</span>
                    {profile && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveDiscount(deal.id);
                        }}
                        className={`flex items-center gap-1 text-xs font-semibold transition-colors ${
                          isSaved ? 'text-teal-600' : 'text-gray-400 hover:text-teal-600'
                        }`}
                      >
                        {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                        {isSaved ? 'Saved' : 'Save'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Link to map */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('map')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-all"
          >
            View on Interactive Map <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {selectedDeal && (
        <DealModal
          deal={selectedDeal}
          isSaved={savedDiscountIds.has(selectedDeal.id)}
          isUsed={false}
          onSave={() => toggleSaveDiscount(selectedDeal.id)}
          onClose={() => setSelectedDeal(null)}
        />
      )}
    </div>
  );
}
