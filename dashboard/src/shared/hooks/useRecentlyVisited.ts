import { useCallback } from "react";
import type { RecentActivity } from "../types";

const STORAGE_KEY = "sesamum_recent_activities";
const MAX_ITEMS = 50;

export const useRecentlyVisited = () => {
  /**
   * Get all recent visits from localStorage
   */
  const getRecentVisits = useCallback((): RecentActivity[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      return JSON.parse(stored) as RecentActivity[];
    } catch (error) {
      console.error("Error reading recent visits from localStorage:", error);
      return [];
    }
  }, []);

  /**
   * Add a new visit to recent history
   * - Deduplicates by entityId and type
   * - Moves existing item to top with updated timestamp
   * - Maintains FIFO with max 50 items
   */
  const addRecentVisit = useCallback(
    (visit: Omit<RecentActivity, "timestamp">) => {
      try {
        const existing = getRecentVisits();
        const timestamp = new Date().toISOString();

        // Remove duplicate if exists (same entityId and type)
        const filtered = existing.filter(
          (item) =>
            !(item.entityId === visit.entityId && item.type === visit.type)
        );

        // Add new visit at the beginning
        const newVisit: RecentActivity = {
          ...visit,
          timestamp,
        };

        const updated = [newVisit, ...filtered];

        // Keep only MAX_ITEMS most recent
        const limited = updated.slice(0, MAX_ITEMS);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));

        // Dispatch storage event for cross-tab synchronization
        window.dispatchEvent(new Event("storage"));
      } catch (error) {
        console.error("Error adding recent visit to localStorage:", error);
      }
    },
    [getRecentVisits]
  );

  /**
   * Clear all recent visits
   */
  const clearRecentVisits = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new Event("storage"));
    } catch (error) {
      console.error("Error clearing recent visits from localStorage:", error);
    }
  }, []);

  return {
    getRecentVisits,
    addRecentVisit,
    clearRecentVisits,
  };
};
