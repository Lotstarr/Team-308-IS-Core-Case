import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export function useSavedItems() {
  const { user } = useAuth();
  const [savedDiscountIds, setSavedDiscountIds] = useState<Set<string>>(new Set());
  const [savedEventIds, setSavedEventIds] = useState<Set<string>>(new Set());
  const [usedDealIds, setUsedDealIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSavedDiscountIds(new Set());
      setSavedEventIds(new Set());
      setUsedDealIds(new Set());
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      const [discountsRes, eventsRes, usedRes] = await Promise.all([
        supabase.from('saved_discounts').select('discount_id').eq('user_id', user.id),
        supabase.from('saved_events').select('event_id').eq('user_id', user.id),
        supabase.from('used_deals').select('discount_id').eq('user_id', user.id),
      ]);

      setSavedDiscountIds(new Set((discountsRes.data || []).map((r) => r.discount_id)));
      setSavedEventIds(new Set((eventsRes.data || []).map((r) => r.event_id)));
      setUsedDealIds(new Set((usedRes.data || []).map((r) => r.discount_id)));
      setLoading(false);
    })();
  }, [user]);

  const toggleSaveDiscount = useCallback(
    async (discountId: string) => {
      if (!user) return;
      if (savedDiscountIds.has(discountId)) {
        setSavedDiscountIds((prev) => {
          const next = new Set(prev);
          next.delete(discountId);
          return next;
        });
        await supabase.from('saved_discounts').delete().eq('user_id', user.id).eq('discount_id', discountId);
      } else {
        setSavedDiscountIds((prev) => new Set(prev).add(discountId));
        await supabase.from('saved_discounts').insert({ user_id: user.id, discount_id: discountId });
      }
    },
    [user, savedDiscountIds]
  );

  const toggleSaveEvent = useCallback(
    async (eventId: string) => {
      if (!user) return;
      if (savedEventIds.has(eventId)) {
        setSavedEventIds((prev) => {
          const next = new Set(prev);
          next.delete(eventId);
          return next;
        });
        await supabase.from('saved_events').delete().eq('user_id', user.id).eq('event_id', eventId);
      } else {
        setSavedEventIds((prev) => new Set(prev).add(eventId));
        await supabase.from('saved_events').insert({ user_id: user.id, event_id: eventId });
      }
    },
    [user, savedEventIds]
  );

  const toggleUsedDeal = useCallback(
    async (discountId: string) => {
      if (!user) return;
      if (usedDealIds.has(discountId)) {
        setUsedDealIds((prev) => {
          const next = new Set(prev);
          next.delete(discountId);
          return next;
        });
        await supabase.from('used_deals').delete().eq('user_id', user.id).eq('discount_id', discountId);
      } else {
        setUsedDealIds((prev) => new Set(prev).add(discountId));
        await supabase.from('used_deals').insert({ user_id: user.id, discount_id: discountId });
      }
    },
    [user, usedDealIds]
  );

  return {
    savedDiscountIds,
    savedEventIds,
    usedDealIds,
    loading,
    toggleSaveDiscount,
    toggleSaveEvent,
    toggleUsedDeal,
  };
}
