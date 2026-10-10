import { useEffect, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, UtensilsCrossed, Clock, MapPin, DoorOpen, Bookmark, BookmarkCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNav } from '@/context/NavContext';
import { useAuth } from '@/context/AuthContext';
import { useSavedItems } from '@/hooks/useSavedItems';
import type { FoodEvent } from '@/types';
import { EventModal } from '@/components/EventModal';
import { formatDate, isToday } from '@/lib/dateUtils';

export function CalendarPage() {
  const { navigate } = useNav();
  const { profile } = useAuth();
  const { savedEventIds, toggleSaveEvent } = useSavedItems();
  const [events, setEvents] = useState<FoodEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<FoodEvent | null>(null);
  const [viewMonth, setViewMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('food_events').select('*').order('date', { ascending: true });
      setEvents((data as FoodEvent[]) || []);
      setLoading(false);
    })();
  }, []);

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: { date: string | null; day: number | null; events: FoodEvent[] }[] = [];

    // Leading blanks
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ date: null, day: null, events: [] });
    }

    // Days of month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayEvents = events.filter((e) => e.date === dateStr);
      days.push({ date: dateStr, day: d, events: dayEvents });
    }

    return days;
  }, [viewMonth, events]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, FoodEvent[]> = {};
    events.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [events]);

  const selectedDateEvents = selectedDate ? eventsByDate[selectedDate] || [] : [];

  const monthName = viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const todayStr = new Date().toISOString().split('T')[0];

  const changeMonth = (delta: number) => {
    const newMonth = new Date(viewMonth);
    newMonth.setMonth(newMonth.getMonth() + delta);
    setViewMonth(newMonth);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Calendar</h1>
          <p className="text-gray-500">View upcoming free food events by date.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => changeMonth(-1)}
                className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h2 className="text-lg font-bold text-gray-900">{monthName}</h2>
              <button
                onClick={() => changeMonth(1)}
                className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-gray-400 uppercase py-2">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            {!loading && (
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, i) => {
                  if (!day.date) {
                    return <div key={i} className="aspect-square" />;
                  }
                  const isCurrentDay = day.date === todayStr;
                  const isSelected = day.date === selectedDate;
                  const hasEvents = day.events.length > 0;

                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(day.date)}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all relative ${
                        isSelected
                          ? 'bg-orange-500 text-white font-bold shadow-md'
                          : isCurrentDay
                          ? 'bg-orange-50 text-orange-600 font-bold ring-1 ring-orange-300'
                          : hasEvents
                          ? 'bg-orange-50/50 text-gray-700 hover:bg-orange-50'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {day.day}
                      {hasEvents && !isSelected && (
                        <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-orange-500" />
                      )}
                      {hasEvents && isSelected && (
                        <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-orange-500" /> Has events
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-orange-50 ring-1 ring-orange-300" /> Today
              </div>
            </div>
          </div>

          {/* Selected date events */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-1">
              {selectedDate ? formatDate(selectedDate) : 'Select a date'}
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              {selectedDate ? `${selectedDateEvents.length} event(s)` : 'Click any date to see events'}
            </p>

            {!selectedDate ? (
              <div className="text-center py-8">
                <UtensilsCrossed className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No date selected</p>
              </div>
            ) : selectedDateEvents.length === 0 ? (
              <div className="text-center py-8">
                <UtensilsCrossed className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No events on this date</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="p-3 rounded-xl bg-orange-50 hover:bg-orange-100 transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shrink-0">
                        <UtensilsCrossed className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-gray-900 truncate">{event.title}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                          <Clock className="w-3 h-3" /> {event.start_time}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" /> {event.location_name}
                        </div>
                      </div>
                      {profile && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSaveEvent(event.id);
                          }}
                          className="p-1.5 rounded-lg hover:bg-white transition-colors shrink-0"
                        >
                          {savedEventIds.has(event.id) ? (
                            <BookmarkCheck className="w-4 h-4 text-orange-600" />
                          ) : (
                            <Bookmark className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          isSaved={savedEventIds.has(selectedEvent.id)}
          onSave={() => profile && toggleSaveEvent(selectedEvent.id)}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
