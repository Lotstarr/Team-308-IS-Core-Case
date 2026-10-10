import { useEffect, useState, useMemo } from 'react';
import {
  MapPin,
  Tag,
  UtensilsCrossed,
  Crown,
  Check,
  ExternalLink,
  Navigation,
  Filter,
  X,
  Sparkles,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNav } from '@/context/NavContext';
import { useAuth } from '@/context/AuthContext';
import { useSavedItems } from '@/hooks/useSavedItems';
import type { Discount, FoodEvent } from '@/types';
import { DealModal } from '@/components/DealModal';
import { EventModal } from '@/components/EventModal';
import { isToday, isPast } from '@/lib/dateUtils';

type MarkerType = 'discount' | 'food';
type FilterCategory = 'all' | 'food' | 'tech' | 'clothing' | 'entertainment' | 'services';

interface MapMarker {
  id: string;
  type: MarkerType;
  lat: number;
  lng: number;
  data: Discount | FoodEvent;
  category: string;
}

export function MapPage() {
  const { navigate } = useNav();
  const { profile } = useAuth();
  const { usedDealIds, toggleUsedDeal } = useSavedItems();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [events, setEvents] = useState<FoodEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState<Discount | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<FoodEvent | null>(null);
  const [activeFilters, setActiveFilters] = useState<Set<FilterCategory>>(new Set(['all']));
  const [showFoodOnly, setShowFoodOnly] = useState(true);
  const [showDiscountsOnly, setShowDiscountsOnly] = useState(true);
  const [popupMarker, setPopupMarker] = useState<MapMarker | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    (async () => {
      const [dealsRes, eventsRes] = await Promise.all([
        supabase.from('discounts').select('*').not('latitude', 'is', null),
        supabase.from('food_events').select('*').not('latitude', 'is', null),
      ]);
      setDiscounts((dealsRes.data as Discount[]) || []);
      setEvents((eventsRes.data as FoodEvent[]) || []);
      setLoading(false);
    })();
  }, []);

  // Build markers from data
  const markers: MapMarker[] = useMemo(() => {
    const result: MapMarker[] = [];
    if (showDiscountsOnly) {
      discounts.forEach((d) => {
        if (d.latitude && d.longitude) {
          const passesFilter = activeFilters.has('all') || activeFilters.has(d.category as FilterCategory);
          if (passesFilter) {
            result.push({
              id: d.id,
              type: 'discount',
              lat: d.latitude,
              lng: d.longitude,
              data: d,
              category: d.category,
            });
          }
        }
      });
    }
    if (showFoodOnly) {
      events.forEach((e) => {
        if (e.latitude && e.longitude && !isPast(e.date)) {
          result.push({
            id: e.id,
            type: 'food',
            lat: e.latitude,
            lng: e.longitude,
            data: e,
            category: 'food',
          });
        }
      });
    }
    return result;
  }, [discounts, events, activeFilters, showFoodOnly, showDiscountsOnly]);

  // Normalize coordinates to percentages on the map
  // Pittsburgh campus area roughly: lat 40.42-40.47, lng -79.97--79.92
  const bounds = { minLat: 40.42, maxLat: 40.47, minLng: -79.97, maxLng: -79.92 };

  const toX = (lng: number) => ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
  const toY = (lat: number) => (1 - (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 100;

  const toggleFilter = (cat: FilterCategory) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (cat === 'all') {
        return new Set(['all']);
      }
      next.delete('all');
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      if (next.size === 0) next.add('all');
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Interactive Map</h1>
          <p className="text-gray-500">Find discounts and free food events near you.</p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap gap-3 mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all"
          >
            <Filter className="w-4 h-4" /> Categories
          </button>
          <button
            onClick={() => setShowDiscountsOnly(!showDiscountsOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
              showDiscountsOnly ? 'bg-teal-50 border-teal-400 text-teal-700' : 'bg-white border-gray-200 text-gray-500'
            }`}
          >
            <Tag className="w-4 h-4" /> Discounts
          </button>
          <button
            onClick={() => setShowFoodOnly(!showFoodOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
              showFoodOnly ? 'bg-orange-50 border-orange-400 text-orange-700' : 'bg-white border-gray-200 text-gray-500'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" /> Free Food
          </button>
        </div>

        {/* Category filters */}
        {showFilters && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4 animate-in slide-in-from-top-2 duration-200">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Discount Categories</label>
            <div className="flex flex-wrap gap-2">
              {(['all', 'food', 'tech', 'clothing', 'entertainment', 'services'] as FilterCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                    activeFilters.has(cat) ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Map background */}
              <div className="relative h-[500px] bg-gradient-to-br from-green-50 via-teal-50 to-blue-50">
                {/* Grid overlay */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px',
                  }}
                />

                {/* Roads */}
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <line x1="0" y1="30%" x2="100%" y2="35%" stroke="#d1d5db" strokeWidth="6" opacity="0.5" />
                  <line x1="0" y1="60%" x2="100%" y2="55%" stroke="#d1d5db" strokeWidth="4" opacity="0.4" />
                  <line x1="30%" y1="0" x2="35%" y2="100%" stroke="#d1d5db" strokeWidth="5" opacity="0.5" />
                  <line x1="70%" y1="0" x2="65%" y2="100%" stroke="#d1d5db" strokeWidth="4" opacity="0.4" />
                </svg>

                {/* Campus area indicator */}
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-white/80 backdrop-blur-sm text-xs font-semibold text-gray-600">
                  Campus Area
                </div>

                {/* Markers */}
                {!loading &&
                  markers.map((marker) => {
                    const x = toX(marker.lng);
                    const y = toY(marker.lat);
                    if (x < 0 || x > 100 || y < 0 || y > 100) return null;

                    const isUsed = marker.type === 'discount' && usedDealIds.has(marker.id);
                    const isFoodToday = marker.type === 'food' && isToday((marker.data as FoodEvent).date);

                    return (
                      <button
                        key={`${marker.type}-${marker.id}`}
                        onClick={() => setPopupMarker(marker)}
                        className="absolute -translate-x-1/2 -translate-y-full transition-all hover:z-20 hover:scale-125"
                        style={{ left: `${x}%`, top: `${y}%`, zIndex: 10 }}
                      >
                        {marker.type === 'discount' ? (
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white ${
                              isUsed ? 'bg-gray-300 opacity-50' : 'bg-teal-500'
                            }`}
                          >
                            {isUsed ? (
                              <Check className="w-4 h-4 text-white" />
                            ) : (marker.data as Discount).is_starving_student ? (
                              <Crown className="w-4 h-4 text-white" />
                            ) : (
                              <Tag className="w-4 h-4 text-white" />
                            )}
                          </div>
                        ) : (
                          <div className="relative">
                            {isFoodToday && (
                              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                            )}
                            <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white bg-orange-500">
                              <UtensilsCrossed className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                        {/* Pin pointer */}
                        <div
                          className={`absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent ${
                            marker.type === 'discount'
                              ? isUsed ? 'border-t-gray-300' : 'border-t-teal-500'
                              : 'border-t-orange-500'
                          }`}
                        />
                      </button>
                    );
                  })}

                {/* Popup */}
                {popupMarker && (
                  <div
                    className="absolute z-30 -translate-x-1/2 -translate-y-full"
                    style={{
                      left: `${Math.max(15, Math.min(85, toX(popupMarker.lng)))}%`,
                      top: `${Math.max(25, toY(popupMarker.lat) - 3)}%`,
                    }}
                  >
                    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-64 animate-in zoom-in-95 duration-150">
                      <button
                        onClick={() => setPopupMarker(null)}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-xs"
                      >
                        ✕
                      </button>

                      {popupMarker.type === 'discount' ? (
                        <DiscountPopup
                          deal={popupMarker.data as Discount}
                          isUsed={usedDealIds.has(popupMarker.id)}
                          onView={() => {
                            setSelectedDeal(popupMarker.data as Discount);
                            setPopupMarker(null);
                          }}
                          onToggleUsed={() => profile && toggleUsedDeal(popupMarker.id)}
                        />
                      ) : (
                        <FoodPopup
                          event={popupMarker.data as FoodEvent}
                          onView={() => {
                            setSelectedEvent(popupMarker.data as FoodEvent);
                            setPopupMarker(null);
                          }}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-md">
                  <div className="text-xs font-semibold text-gray-500 mb-2">Legend</div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-gray-700">
                      <div className="w-4 h-4 rounded-full bg-teal-500 flex items-center justify-center">
                        <Tag className="w-2.5 h-2.5 text-white" />
                      </div>
                      Discount
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-700">
                      <div className="w-4 h-4 rounded-full bg-teal-500 flex items-center justify-center">
                        <Crown className="w-2.5 h-2.5 text-white" />
                      </div>
                      Student Card Deal
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-700">
                      <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                      Used Deal
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-700">
                      <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center">
                        <UtensilsCrossed className="w-2.5 h-2.5 text-white" />
                      </div>
                      Free Food
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side panel - nearby list */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 max-h-[500px] overflow-y-auto">
            <h3 className="font-bold text-gray-900 mb-3">Nearby ({markers.length})</h3>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : markers.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No locations to display.</p>
            ) : (
              <div className="space-y-2">
                {markers.map((marker) => {
                  if (marker.type === 'discount') {
                    const deal = marker.data as Discount;
                    const isUsed = usedDealIds.has(marker.id);
                    return (
                      <button
                        key={marker.id}
                        onClick={() => setSelectedDeal(deal)}
                        className={`w-full flex items-center gap-2 p-2.5 rounded-xl text-left transition-all ${
                          isUsed ? 'bg-gray-50 opacity-50' : 'bg-gray-50 hover:bg-teal-50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isUsed ? 'bg-gray-200' : 'bg-teal-500'
                        }`}>
                          {isUsed ? <Check className="w-4 h-4 text-gray-400" /> : <Tag className="w-4 h-4 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate">{deal.title}</div>
                          <div className="text-xs text-gray-500">{deal.company} · {deal.discount_value}</div>
                        </div>
                      </button>
                    );
                  } else {
                    const event = marker.data as FoodEvent;
                    return (
                      <button
                        key={marker.id}
                        onClick={() => setSelectedEvent(event)}
                        className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-left transition-all"
                      >
                        <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shrink-0">
                          <UtensilsCrossed className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate">{event.title}</div>
                          <div className="text-xs text-gray-500">{event.start_time} · {event.location_name}</div>
                        </div>
                      </button>
                    );
                  }
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedDeal && (
        <DealModal
          deal={selectedDeal}
          isSaved={false}
          isUsed={usedDealIds.has(selectedDeal.id)}
          showUsedToggle={!!profile && selectedDeal.is_starving_student}
          showSaveToggle={false}
          onToggleUsed={() => toggleUsedDeal(selectedDeal.id)}
          onClose={() => setSelectedDeal(null)}
        />
      )}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          isSaved={false}
          showSaveToggle={false}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}

function DiscountPopup({
  deal,
  isUsed,
  onView,
  onToggleUsed,
}: {
  deal: Discount;
  isUsed: boolean;
  onView: () => void;
  onToggleUsed: () => void;
}) {
  const directionsUrl = deal.latitude && deal.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${deal.latitude},${deal.longitude}`
    : '#';

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isUsed ? 'bg-gray-200' : 'bg-teal-500'}`}>
          {isUsed ? <Check className="w-4 h-4 text-gray-400" /> : <Tag className="w-4 h-4 text-white" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-400">{deal.company}</div>
          <div className="text-sm font-bold text-gray-900 truncate">{deal.discount_value}</div>
        </div>
      </div>
      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{deal.title}</p>
      <div className="flex gap-2">
        <button
          onClick={onView}
          className="flex-1 text-xs font-semibold text-teal-600 hover:text-teal-700"
        >
          Details
        </button>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          <Navigation className="w-3 h-3" /> Directions
        </a>
        {deal.is_starving_student && (
          <button
            onClick={onToggleUsed}
            className={`text-xs font-semibold ${isUsed ? 'text-gray-500' : 'text-emerald-600 hover:text-emerald-700'}`}
          >
            {isUsed ? 'Undo' : 'Mark Used'}
          </button>
        )}
      </div>
    </div>
  );
}

function FoodPopup({ event, onView }: { event: FoodEvent; onView: () => void }) {
  const directionsUrl = event.latitude && event.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`
    : '#';

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
          <UtensilsCrossed className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-orange-600 font-semibold">Free Food</div>
          <div className="text-sm font-bold text-gray-900 truncate">{event.food_type}</div>
        </div>
      </div>
      <p className="text-xs text-gray-600 mb-2 line-clamp-1">{event.title}</p>
      <div className="text-xs text-gray-500 mb-2">
        {event.start_time} · {event.location_name}
      </div>
      <div className="flex gap-2">
        <button
          onClick={onView}
          className="flex-1 text-xs font-semibold text-orange-600 hover:text-orange-700"
        >
          Details
        </button>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          <Navigation className="w-3 h-3" /> Directions
        </a>
      </div>
    </div>
  );
}
