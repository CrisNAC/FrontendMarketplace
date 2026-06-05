import { useEffect, useMemo, useState } from "react";
import { computeStoreAvailability } from "../lib/storeBusinessHours";

const REFRESH_MS = 10_000;

/**
 * Recalcula is_open en el cliente cada 30s (los horarios HH:mm son en hora local).
 */
export function useStoreAvailability(schedules, fallback = {}) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), REFRESH_MS);
    return () => window.clearInterval(id);
  }, []);

  return useMemo(() => {
    const hasSchedules = Array.isArray(schedules) && schedules.length > 0;
    if (!hasSchedules) {
      return {
        is_open: Boolean(fallback.is_open),
        close_time: fallback.close_time ?? null,
        open_time: fallback.open_time ?? null,
      };
    }

    const live = computeStoreAvailability(schedules, now);
    return {
      is_open: live.is_open,
      close_time: live.close_time ?? fallback.close_time ?? null,
      open_time: live.open_time ?? fallback.open_time ?? null,
    };
  }, [schedules, fallback.is_open, fallback.close_time, fallback.open_time, now]);
}
