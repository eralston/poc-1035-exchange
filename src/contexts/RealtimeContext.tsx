import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { DomainEvent } from '../types/Events';

interface RealtimeContextType {
  isConnected: boolean;
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastEvent?: DomainEvent;
  subscribe: (eventType: string, callback: (event: DomainEvent) => void) => () => void;
  emit: (event: DomainEvent) => void;
  reconnect: () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

interface RealtimeProviderProps {
  children: React.ReactNode;
  wsUrl?: string;
}

export const RealtimeProvider: React.FC<RealtimeProviderProps> = ({ 
  children, 
  wsUrl = 'ws://localhost:3001/ws' 
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastEvent, setLastEvent] = useState<DomainEvent>();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [subscribers, setSubscribers] = useState<Map<string, Set<(event: DomainEvent) => void>>>(new Map());
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (ws?.readyState === WebSocket.OPEN) return;

    setConnectionState('connecting');
    
    try {
      // For demo purposes, we'll simulate WebSocket connection
      // In production, this would be a real WebSocket connection
      const mockWs = {
        readyState: WebSocket.OPEN,
        send: (data: string) => {
          console.log('Mock WebSocket send:', data);
        },
        close: () => {
          setIsConnected(false);
          setConnectionState('disconnected');
        },
        addEventListener: (event: string, handler: any) => {
          // Mock event listeners
        },
        removeEventListener: (event: string, handler: any) => {
          // Mock event listeners
        }
      } as any;

      setWs(mockWs);
      setIsConnected(true);
      setConnectionState('connected');
      setReconnectAttempts(0);

      // Simulate receiving events periodically for demo
      const eventInterval = setInterval(() => {
        if (Math.random() > 0.7) { // 30% chance of receiving an event
          const mockEvent: DomainEvent = {
            eventId: `evt_${Date.now()}`,
            eventType: 'DropTicketSubmitted',
            aggregateId: `drop-ticket-${Math.random().toString(36).substr(2, 9)}`,
            aggregateType: 'DropTicket',
            version: 1,
            timestamp: new Date().toISOString(),
            data: {
              ticketNumber: `EX${Date.now().toString().slice(-6)}`,
              submittedBy: 'demo-user',
              targetProductType: Math.random() > 0.5 ? 'life_insurance' : 'annuity',
              sourceAccountCount: Math.floor(Math.random() * 3) + 1,
              estimatedValue: Math.floor(Math.random() * 500000) + 50000,
              partiesInvolved: []
            },
            metadata: {
              userId: 'demo-user'
            }
          } as any;

          setLastEvent(mockEvent);
          notifySubscribers(mockEvent);
        }
      }, 5000); // Every 5 seconds

      // Clean up interval when connection closes
      (mockWs as any).closeInterval = eventInterval;

    } catch (error) {
      console.error('WebSocket connection error:', error);
      setConnectionState('error');
      scheduleReconnect();
    }
  }, [ws]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectAttempts < maxReconnectAttempts) {
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // Exponential backoff
      setTimeout(() => {
        setReconnectAttempts(prev => prev + 1);
        connect();
      }, delay);
    }
  }, [reconnectAttempts, connect]);

  const notifySubscribers = useCallback((event: DomainEvent) => {
    // Notify specific event type subscribers
    const eventSubscribers = subscribers.get(event.eventType);
    if (eventSubscribers) {
      eventSubscribers.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in event subscriber:', error);
        }
      });
    }

    // Notify wildcard subscribers
    const wildcardSubscribers = subscribers.get('*');
    if (wildcardSubscribers) {
      wildcardSubscribers.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in wildcard subscriber:', error);
        }
      });
    }
  }, [subscribers]);

  const subscribe = useCallback((eventType: string, callback: (event: DomainEvent) => void) => {
    setSubscribers(prev => {
      const newSubscribers = new Map(prev);
      if (!newSubscribers.has(eventType)) {
        newSubscribers.set(eventType, new Set());
      }
      newSubscribers.get(eventType)!.add(callback);
      return newSubscribers;
    });

    // Return unsubscribe function
    return () => {
      setSubscribers(prev => {
        const newSubscribers = new Map(prev);
        const eventSubscribers = newSubscribers.get(eventType);
        if (eventSubscribers) {
          eventSubscribers.delete(callback);
          if (eventSubscribers.size === 0) {
            newSubscribers.delete(eventType);
          }
        }
        return newSubscribers;
      });
    };
  }, []);

  const emit = useCallback((event: DomainEvent) => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(event));
    }
    
    // Also handle locally for immediate feedback
    setLastEvent(event);
    notifySubscribers(event);
  }, [ws, notifySubscribers]);

  const reconnect = useCallback(() => {
    if (ws) {
      ws.close();
      if ((ws as any).closeInterval) {
        clearInterval((ws as any).closeInterval);
      }
    }
    setReconnectAttempts(0);
    connect();
  }, [ws, connect]);

  useEffect(() => {
    connect();

    return () => {
      if (ws) {
        ws.close();
        if ((ws as any).closeInterval) {
          clearInterval((ws as any).closeInterval);
        }
      }
    };
  }, []);

  const value: RealtimeContextType = {
    isConnected,
    connectionState,
    lastEvent,
    subscribe,
    emit,
    reconnect
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = (): RealtimeContextType => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};