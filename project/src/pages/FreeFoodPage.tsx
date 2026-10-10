import { useEffect, useState, useMemo } from 'react';
import {
  UtensilsCrossed,
  Search,
  Bookmark,
  BookmarkCheck,
  Calendar as CalendarIcon,
  Map as MapIcon,
  Clock,
  MapPin,
  Sun,
  CalendarDays,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNav } from '@/context/NavContext';
import { useAuth } from '@/context/AuthContext';
import { useSavedItems } from '@/hooks/useSavedItems';
import type { FoodEvent } from '@/types';
import { EventModal } from '@/components/EventModal';
import { isToday, isThisWeek, formatDate, getRelativeDateLabel, isPast } from '@/lib/dateUtils';

export function FreeFoodPage() {
  const { navigate } = useNav();
  const { profile } = useAuth();
  const { savedEventIds, toggleSaveEvent } = useSavedItems();
  const [events, setEvents] = useState<FoodEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<FoodEvent | null>(null);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'today' | 'week'>('today');

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().split('T')[0];
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      const weekStr = weekFromNow.toISOString().split('T')[0];

      const { data } = await supabase
        .from('food_events')
        .select('*')
        .gte('date', today)
        .lte('date', weekStr)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });
      setEvents((data as FoodEvent[]) || []);
      setLoading(false);
    })();
  }, []);

  const filteredEvents = useMemo(() => {
    let result = events.filter((e) => !isPast(e.date));

    if (tab === 'today') {
      result = result.filter((e) => isToday(e.date));
    } else {
      result = result.filter((e) => isThisWeek(e.date));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.food_type.toLowerCase().includes(q) ||
          e.location_name.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q)
      );
    }

    return result;
  }, [events, tab, search]);

  // Group events by date for week view
  const groupedEvents = useMemo(() => {
    if (tab !== 'week') return null;
    const groups: Record<string, FoodEvent[]> = {};
    filteredEvents.forEach((e) => {
      if (!groups[e.date]) groups[e.date] = [];
      groups[e.date].push(e);
    });
    return groups;
  }, [filteredEvents, tab]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
            <UtensilsCrossed className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Free Food Near Me</h1>
            <p className="text-gray-500">Find free food events on campus, today and this week.</p>
          </div>
        </div>

        {/* Quick links */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => navigate('calendar')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all"
          >
            <CalendarIcon className="w-4 h-4" /> Calendar
          </button>
          <button
            onClick={() => navigate('map')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all"
          >
            <MapIcon className="w-4 h-4" /> Map
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTab('today')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === 'today' ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Sun className="w-4 h-4" /> Today
          </button>
          <button
            onClick={() => setTab('week')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === 'week' ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <CalendarDays className="w-4 h-4" /> This Week
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by food type, location, or event name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm"
          />
        </div>

        {/* Events */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
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
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-1">
              {tab === 'today' ? 'No free food events today.' : 'No upcoming events this week.'}
            </p>
            {tab === 'today' && (
              <button
                onClick={() => setTab('week')}
                className="text-orange-600 font-semibold text-sm hover:text-orange-700 mt-2"
              >
                Check this week's events →
              </button>
            )}
          </div>
        ) : tab === 'today' ? (
          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isSaved={savedEventIds.has(event.id)}
                onSave={() => profile && toggleSaveEvent(event.id)}
                onClick={() => setSelectedEvent(event)}
                showProfilePrompt={!profile}
                onProfilePrompt={() => navigate('login')}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedEvents || {}).map(([date, dayEvents]) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2 h-2 rounded-full ${isToday(date) ? 'bg-orange-500' : 'bg-gray-300'}`} />
                  <h3 className="text-sm font-bold text-gray-700">
                    {isToday(date) ? 'Today' : formatDate(date)}
                  </h3>
                  <span className="text-xs text-gray-400">({dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''})</span>
                </div>
                <div className="space-y-3">
                  {dayEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      isSaved={savedEventIds.has(event.id)}
                      onSave={() => profile && toggleSaveEvent(event.id)}
                      onClick={() => setSelectedEvent(event)}
                      showProfilePrompt={!profile}
                      onProfilePrompt={() => navigate('login')}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          isSaved={savedEventIds.has(selectedEvent.id)}
          onSave={() => profile && toggleSaveEvent(selectedEvent.id)}
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

function EventCard({
  event,
  isSaved,
  onSave,
  onClick,
  showProfilePrompt,
  onProfilePrompt,
}: {
  event: FoodEvent;
  isSaved: boolean;
  onSave: () => void;
  onClick: () => void;
  showProfilePrompt: boolean;
  onProfilePrompt: () => void;
}) {
  return (
    <div
      className="group flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer"
      onClick={onClick}
    >
      {/* Icon */}
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shrink-0 shadow-md">
        <UtensilsCrossed className="w-7 h-7 text-white" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs text-orange-600 font-semibold">{getRelativeDateLabel(event.date)}</span>
          {isToday(event.date) && (
            <span className="text-xs text-white bg-orange-500 px-2 py-0.5 rounded-full font-bold">TODAY</span>
          )}
        </div>
        <h3 className="font-bold text-gray-900 text-sm truncate">{event.title}</h3>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {event.start_time}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {event.location_name}
          </span>
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (showProfilePrompt) {
            onProfilePrompt();
          } else {
            onSave();
          }
        }}
        className={`p-2 rounded-lg transition-colors shrink-0 ${
          isSaved ? 'text-orange-600 bg-orange-50' : 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'
        }`}
      >
        {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
      </button>
    </div>
  );
}
