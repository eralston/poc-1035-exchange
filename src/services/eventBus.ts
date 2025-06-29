import { DomainEvent } from '../types/Events';

// Event listener type
type EventListener<T extends DomainEvent = DomainEvent> = (event: T) => void;

// Event bus for managing domain events in memory
class EventBus {
  private listeners: Map<string, EventListener[]> = new Map();
  private eventHistory: DomainEvent[] = [];

  // Subscribe to specific event types
  subscribe<T extends DomainEvent>(eventType: T['eventType'], listener: EventListener<T>): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    
    const typedListeners = this.listeners.get(eventType)!;
    typedListeners.push(listener as EventListener);

    // Return unsubscribe function
    return () => {
      const index = typedListeners.indexOf(listener as EventListener);
      if (index > -1) {
        typedListeners.splice(index, 1);
      }
    };
  }

  // Subscribe to all events
  subscribeToAll(listener: EventListener): () => void {
    const eventTypes = [
      'DropTicketSubmitted',
      'AccountValidated',
      'PartyRelationCreated',
      'CarrierRequestSent',
      'TransferConfirmed',
      'ExchangeCompleted',
      'SLAWarning',
      'OverrideApplied'
    ];

    const unsubscribeFunctions = eventTypes.map(eventType => 
      this.subscribe(eventType as any, listener)
    );

    return () => {
      unsubscribeFunctions.forEach(unsub => unsub());
    };
  }

  // Emit an event
  emit<T extends DomainEvent>(event: T): void {
    // Store in event history
    this.eventHistory.push(event);

    // Notify listeners
    const listeners = this.listeners.get(event.eventType) || [];
    listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error(`Error in event listener for ${event.eventType}:`, error);
      }
    });

    // Log event for debugging
    console.log(`Event emitted: ${event.eventType}`, event);
  }

  // Get event history
  getEventHistory(): DomainEvent[] {
    return [...this.eventHistory];
  }

  // Get events for specific aggregate
  getEventsForAggregate(aggregateId: string): DomainEvent[] {
    return this.eventHistory.filter(event => event.aggregateId === aggregateId);
  }

  // Clear event history (useful for testing)
  clearHistory(): void {
    this.eventHistory = [];
  }
}

// Export singleton instance
export const eventBus = new EventBus();

// Helper function to create events with common metadata
export const createEvent = <T extends DomainEvent>(
  eventData: Omit<T, 'eventId' | 'timestamp' | 'version'>,
  userId: string,
  ipAddress?: string,
  userAgent?: string
): T => {
  return {
    ...eventData,
    eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    version: 1,
    metadata: {
      userId,
      ipAddress,
      userAgent,
      ...eventData.metadata
    }
  } as T;
};