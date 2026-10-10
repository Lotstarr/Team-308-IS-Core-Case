import { Clock, MapPin, DoorOpen, Utensils, CalendarDays, Bookmark, BookmarkCheck } from 'lucide-react';
import type { FoodEvent } from '@/types';
import { formatDate } from '@/lib/dateUtils';

interface EventModalProps {
  event: FoodEvent;
  isSaved: boolean;
  showSaveToggle?: boolean;
  onSave?: () => void;
  onClose: () => void;
  onViewCalendar?: () => void;
}

export function EventModal({
  event,
  isSaved,
  showSaveToggle = true,
  onSave,
  onClose,
  onViewCalendar,
}: EventModalProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-32 bg-gradient-to-br from-orange-400 to-red-500 rounded-t-2xl overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 right-8 w-24 h-24 bg-white rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-12 w-32 h-32 bg-white rounded-full blur-3xl" />
          </div>
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/90 text-orange-600">
              <Utensils className="w-3.5 h-3.5" /> Free Food
            </span>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{event.title}</h2>
          <p className="text-sm text-orange-600 font-medium mb-4">{event.food_type}</p>

          <p className="text-gray-600 text-sm leading-relaxed mb-5">{event.description}</p>

          <div className="space-y-3 mb-5">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                <CalendarDays className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Date</div>
                <div className="text-gray-700 font-medium">{formatDate(event.date)}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Time</div>
                <div className="text-gray-700 font-medium">{event.start_time} – {event.end_time}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Location</div>
                <div className="text-gray-700 font-medium">{event.location_name}</div>
              </div>
            </div>
            {event.room_number && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                  <DoorOpen className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Room</div>
                  <div className="text-gray-700 font-medium">{event.room_number}</div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {onViewCalendar && (
              <button
                onClick={onViewCalendar}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-all"
              >
                View on Calendar <CalendarDays className="w-4 h-4" />
              </button>
            )}
            {showSaveToggle && (
              <button
                onClick={onSave}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm border-2 transition-all ${
                  isSaved
                    ? 'border-orange-500 bg-orange-50 text-orange-600'
                    : 'border-gray-200 text-gray-600 hover:border-orange-300'
                }`}
              >
                {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                {isSaved ? 'Saved' : 'Save Event'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
