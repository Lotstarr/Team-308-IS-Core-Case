import { useEffect, useState } from 'react';
import {
  Tag,
  GraduationCap,
  UtensilsCrossed,
  Calendar,
  Map,
  Bookmark,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Sun,
  TrendingUp,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNav } from '@/context/NavContext';
import { useAuth } from '@/context/AuthContext';
import { useSavedItems } from '@/hooks/useSavedItems';
import type { Discount, FoodEvent, PageName } from '@/types';
import { DealModal } from '@/components/DealModal';
import { EventModal } from '@/components/EventModal';
import { isToday, getRelativeDateLabel } from '@/lib/dateUtils';

const features: {
  page: PageName;
  title: string;
  description: string;
  icon: typeof Tag;
  gradient: string;
  iconBg: string;
}[] = [
  {
    page: 'discount-dashboard',
    title: 'Discount Dashboard',
    description: 'Browse hundreds of student discounts across food, tech, clothing, and more. Filter, search, and save your favorites.',
    icon: Tag,
    gradient: 'from-teal-500 to-cyan-600',
    iconBg: 'bg-teal-500',
  },
  {
    page: 'starving-student-hub',
    title: 'Student Card Hub',
    description: 'Track every deal available with your Starving Student Card. Mark deals as used so you never forget which ones you have left.',
    icon: GraduationCap,
    gradient: 'from-emerald-500 to-green-600',
    iconBg: 'bg-emerald-500',
  },
  {
    page: 'free-food',
    title: 'Free Food Near Me',
    description: 'Find free food events happening on campus today and this week. Never miss a free meal again.',
    icon: UtensilsCrossed,
    gradient: 'from-orange-400 to-red-500',
    iconBg: 'bg-orange-500',
  },
];

export function HomePage() {
  const { navigate, searchQuery, setSearchQuery } = useNav();
  const { profile } = useAuth();
  const { savedDiscountIds, savedEventIds, toggleSaveDiscount, toggleSaveEvent } = useSavedItems();
  const [savedDeals, setSavedDeals] = useState<Discount[]>([]);
  const [todayEvents, setTodayEvents] = useState<FoodEvent[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<Discount | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<FoodEvent | null>(null);

  useEffect(() => {
    (async () => {
      // Load today's events
      const today = new Date().toISOString().split('T')[0];
      const { data: events } = await supabase
        .from('food_events')
        .select('*')
        .eq('date', today)
        .order('start_time');
      setTodayEvents((events as FoodEvent[]) || []);

      // Load saved deals
      if (profile && savedDiscountIds.size > 0) {
        const { data: deals } = await supabase
          .from('discounts')
          .select('*')
          .in('id', [...savedDiscountIds]);
        setSavedDeals((deals as Discount[]) || []);
      } else {
        setSavedDeals([]);
      }
    })();
  }, [profile, savedDiscountIds]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-20 w-96 h-96 bg-cyan-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-teal-100 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Your campus savings companion
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
              Save more. Eat free. Live better.
            </h1>
            <p className="text-lg text-teal-100 leading-relaxed mb-8">
              Discover student discounts, track your Starving Student Card deals, and find free food events happening right now on campus.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('discount-dashboard')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-teal-700 font-semibold hover:shadow-lg transition-all"
              >
                Browse Discounts <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('free-food')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 backdrop-blur-sm text-white font-semibold border border-white/20 hover:bg-white/20 transition-all"
              >
                Find Free Food <UtensilsCrossed className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {features.map((f) => (
            <button
              key={f.page}
              onClick={() => navigate(f.page)}
              className="group text-left bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                <f.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">{f.description}</p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-teal-600 group-hover:gap-2 transition-all">
                Explore <ArrowRight className="w-4 h-4" />
              </span>
            </button>
          ))}
        </div>

        {/* Quick links to all features */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-12">
          <div className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Quick Access</div>
          <div className="flex flex-wrap gap-3">
            {[
              { page: 'discount-dashboard' as PageName, label: 'Discount Dashboard', icon: Tag },
              { page: 'starving-student-hub' as PageName, label: 'Student Card Hub', icon: GraduationCap },
              { page: 'free-food' as PageName, label: 'Free Food', icon: UtensilsCrossed },
              { page: 'calendar' as PageName, label: 'Calendar', icon: Calendar },
              { page: 'map' as PageName, label: 'Interactive Map', icon: Map },
            ].map(({ page, label, icon: Icon }) => (
              <button
                key={page}
                onClick={() => navigate(page)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 hover:bg-teal-50 text-gray-700 hover:text-teal-700 text-sm font-medium transition-all"
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Two-column: Your Hub + Today */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Your Hub */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center">
                <Bookmark className="w-5 h-5 text-teal-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Your Hub</h2>
            </div>

            {!profile ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm mb-4">Sign in to save deals and personalize your hub.</p>
                <button
                  onClick={() => navigate('login')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 text-white font-semibold text-sm hover:bg-teal-600 transition-colors"
                >
                  Sign In / Sign Up
                </button>
              </div>
            ) : savedDeals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm mb-4">You haven't saved any deals yet.</p>
                <button
                  onClick={() => navigate('discount-dashboard')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors"
                >
                  Browse Discounts <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {savedDeals.slice(0, 5).map((deal) => (
                  <button
                    key={deal.id}
                    onClick={() => setSelectedDeal(deal)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-teal-50 transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shrink-0">
                      <Tag className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-900 truncate">{deal.title}</div>
                      <div className="text-xs text-gray-500">{deal.company} · {deal.discount_value}</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-teal-600 transition-colors shrink-0" />
                  </button>
                ))}
                {savedDeals.length > 5 && (
                  <button
                    onClick={() => navigate('discount-dashboard')}
                    className="w-full text-center text-sm font-medium text-teal-600 hover:text-teal-700 py-2"
                  >
                    View all {savedDeals.length} saved deals →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Today's Events */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
                <Sun className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Today:</h2>
              <span className="text-sm text-gray-400">
                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </span>
            </div>

            {todayEvents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm mb-4">No free food events today.</p>
                <button
                  onClick={() => navigate('free-food')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors"
                >
                  See Upcoming <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {todayEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-orange-50 hover:bg-orange-100 transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shrink-0">
                      <UtensilsCrossed className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-900 truncate">{event.title}</div>
                      <div className="text-xs text-gray-500">
                        {event.start_time} · {event.location_name}
                      </div>
                    </div>
                    <span
                      className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:gap-2 transition-all cursor-pointer shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('calendar');
                      }}
                    >
                      Calendar <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
          {[
            { label: 'Total Discounts', value: '24+', icon: Tag },
            { label: 'Student Card Deals', value: '9', icon: GraduationCap },
            { label: 'Free Food This Week', value: '8', icon: UtensilsCrossed },
            { label: 'New Deals', value: '5', icon: TrendingUp },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <stat.icon className="w-5 h-5 text-teal-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {selectedDeal && (
        <DealModal
          deal={selectedDeal}
          isSaved={savedDiscountIds.has(selectedDeal.id)}
          isUsed={false}
          onSave={() => toggleSaveDiscount(selectedDeal.id)}
          onClose={() => setSelectedDeal(null)}
        />
      )}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          isSaved={savedEventIds.has(selectedEvent.id)}
          onSave={() => toggleSaveEvent(selectedEvent.id)}
          onClose={() => setSelectedEvent(null)}
          onViewCalendar={() => {
            setSelectedEvent(null);
            navigate('calendar');
          }}
        />
      )}
    </div>
  );
}
