import { useEffect, useCallback, useState } from 'react';
import { useRealtime } from '../contexts/RealtimeContext';
import { DomainEvent } from '../types/Events';

interface UseRealtimeSubscriptionOptions {
  eventTypes?: string[];
  onEvent?: (event: DomainEvent) => void;
  autoReconnect?: boolean;
}

export const useRealtimeSubscription = (options: UseRealtimeSubscriptionOptions = {}) => {
  const { eventTypes = ['*'], onEvent, autoReconnect = true } = options;
  const { subscribe, isConnected, connectionState, lastEvent, reconnect } = useRealtime();
  const [events, setEvents] = useState<DomainEvent[]>([]);

  const handleEvent = useCallback((event: DomainEvent) => {
    setEvents(prev => [event, ...prev.slice(0, 99)]); // Keep last 100 events
    onEvent?.(event);
  }, [onEvent]);

  useEffect(() => {
    const unsubscribeFunctions = eventTypes.map(eventType => 
      subscribe(eventType, handleEvent)
    );

    return () => {
      unsubscribeFunctions.forEach(unsub => unsub());
    };
  }, [eventTypes, subscribe, handleEvent]);

  useEffect(() => {
    if (autoReconnect && connectionState === 'error') {
      const timer = setTimeout(() => {
        reconnect();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [connectionState, autoReconnect, reconnect]);

  return {
    events,
    lastEvent,
    isConnected,
    connectionState,
    reconnect,
    clearEvents: () => setEvents([])
  };
};

// Hook for live data updates
export const useLiveData = <T>(
  fetchData: () => Promise<T>,
  dependencies: any[] = [],
  refreshOnEvents: string[] = ['*']
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const { subscribe } = useRealtime();

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const newData = await fetchData();
      setData(newData);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  // Initial data load
  useEffect(() => {
    refreshData();
  }, dependencies);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribeFunctions = refreshOnEvents.map(eventType =>
      subscribe(eventType, () => {
        // Debounce rapid updates
        setTimeout(refreshData, 500);
      })
    );

    return () => {
      unsubscribeFunctions.forEach(unsub => unsub());
    };
  }, [subscribe, refreshData, refreshOnEvents]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh: refreshData
  };
};

// Hook for real-time notifications
export const useRealtimeNotifications = () => {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
  }>>([]);

  const { subscribe } = useRealtime();

  useEffect(() => {
    const unsubscribe = subscribe('*', (event: DomainEvent) => {
      let notification;

      switch (event.eventType) {
        case 'DropTicketSubmitted':
          notification = {
            id: event.eventId,
            type: 'info' as const,
            title: 'New Exchange Submitted',
            message: `Exchange ${event.data.ticketNumber} has been submitted`,
            timestamp: new Date(event.timestamp),
            read: false
          };
          break;

        case 'ExchangeCompleted':
          notification = {
            id: event.eventId,
            type: 'success' as const,
            title: 'Exchange Completed',
            message: `Exchange ${event.data.ticketNumber} has been completed successfully`,
            timestamp: new Date(event.timestamp),
            read: false
          };
          break;

        case 'SLAWarning':
          notification = {
            id: event.eventId,
            type: 'warning' as const,
            title: 'SLA Warning',
            message: `SLA deadline approaching for carrier communication`,
            timestamp: new Date(event.timestamp),
            read: false
          };
          break;

        default:
          return; // Don't create notification for other events
      }

      setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50 notifications
    });

    return unsubscribe;
  }, [subscribe]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications
  };
};