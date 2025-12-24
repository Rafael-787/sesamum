import { useState, useEffect, useCallback, useRef } from "react";

interface UseRealTimeDataOptions {
  interval?: number;
  enabled?: boolean;
  pauseWhenHidden?: boolean;
}

interface UseRealTimeDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  isOnline: boolean;
  lastUpdate: Date | null;
  refetch: () => Promise<void>;
}

export const useRealTimeData = <T>(
  fetchFn: () => Promise<T>,
  options: UseRealTimeDataOptions = {}
): UseRealTimeDataReturn<T> => {
  const {
    interval = 600000, // 10 minutes in milliseconds
    enabled = true,
    pauseWhenHidden = true,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const intervalRef = useRef<number | null>(null);
  const isHiddenRef = useRef(false);

  const fetchData = useCallback(
    async (showLoading = false) => {
      if (!enabled || !isOnline) return;

      if (showLoading) setLoading(true);

      try {
        const result = await fetchFn();
        setData(result);
        setError(null);
        setLastUpdate(new Date());
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        console.error("Real-time data fetch error:", err);
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [fetchFn, enabled, isOnline]
  );

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      if (!pauseWhenHidden || !isHiddenRef.current) {
        fetchData(false);
      }
    }, interval);
  }, [fetchData, interval, pauseWhenHidden]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Manual refetch function (for refresh button)
  const refetch = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setError(null);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setError("Connection lost. Data may be outdated.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Handle page visibility changes
  useEffect(() => {
    if (!pauseWhenHidden) return;

    const handleVisibilityChange = () => {
      isHiddenRef.current = document.hidden;

      if (!document.hidden && enabled) {
        // Fetch immediately when page becomes visible
        fetchData(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchData, enabled, pauseWhenHidden]);

  // Main effect for starting/stopping polling
  useEffect(() => {
    if (!enabled || !isOnline) {
      stopPolling();
      return;
    }

    // Initial fetch
    fetchData(true);

    // Start polling
    startPolling();

    return () => {
      stopPolling();
    };
  }, [enabled, isOnline, startPolling, stopPolling, fetchData]);

  return {
    data,
    loading,
    error,
    isOnline,
    lastUpdate,
    refetch,
  };
};
