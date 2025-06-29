// Domain Events
export interface BaseEvent {
  eventId: string;
  aggregateId: string;
  aggregateType: string;
  version: number;
  timestamp: string;
  metadata: {
    userId: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

export interface DropTicketSubmittedEvent extends BaseEvent {
  eventType: 'DropTicketSubmitted';
  aggregateType: 'DropTicket';
  
  data: {
    ticketNumber: string;
    submittedBy: string;
    targetProductType: 'life_insurance' | 'annuity';
    sourceAccountCount: number;
    estimatedValue?: number;
    partiesInvolved: Array<{
      partyId: string;
      relationType: string;
    }>;
  };
}

export interface AccountValidatedEvent extends BaseEvent {
  eventType: 'AccountValidated';
  aggregateType: 'DropTicket';
  
  data: {
    accountId: string;
    accountNumber: string;
    carrierId: string;
    validationResult: 'passed' | 'failed';
    validationNotes?: string;
    eligibleFor1035: boolean;
  };
}

export interface PartyRelationCreatedEvent extends BaseEvent {
  eventType: 'PartyRelationCreated';
  aggregateType: 'DropTicket' | 'Account';
  
  data: {
    relationId: string;
    partyId: string;
    relationType: 'owner' | 'insured' | 'agent' | 'beneficiary' | 'user' | 'carrier_rep';
    relationshipToOwner?: string;
    userRole?: string;
    startDate: string;
  };
}

export interface CarrierRequestSentEvent extends BaseEvent {
  eventType: 'CarrierRequestSent';
  aggregateType: 'DropTicket';
  
  data: {
    communicationId: string;
    carrierId: string;
    accountId: string;
    method: 'email' | 'fax' | 'api' | 'phone';
    slaDeadline: string;
  };
}

export interface TransferConfirmedEvent extends BaseEvent {
  eventType: 'TransferConfirmed';
  aggregateType: 'DropTicket';
  
  data: {
    accountId: string;
    accountNumber: string;
    carrierId: string;
    transferValue: number;
    confirmationMethod: 'email' | 'api' | 'fax';
    confirmationReference?: string;
  };
}

export interface ExchangeCompletedEvent extends BaseEvent {
  eventType: 'ExchangeCompleted';
  aggregateType: 'DropTicket';
  
  data: {
    ticketNumber: string;
    totalValue: number;
    cycleTimeHours: number;
    accountsTransferred: number;
    targetAccountNumber?: string;
  };
}

// System Events
export interface SLAWarningEvent extends BaseEvent {
  eventType: 'SLAWarning';
  aggregateType: 'CarrierCommunication';
  
  data: {
    communicationId: string;
    carrierId: string;
    dropTicketId: string;
    hoursUntilBreach: number;
    warningLevel: 'yellow' | 'red';
  };
  
  metadata: {
    userId: string;
    triggeredBy: 'system';
  };
}

export interface OverrideAppliedEvent extends BaseEvent {
  eventType: 'OverrideApplied';
  aggregateType: 'DropTicket';
  
  data: {
    overrideType: 'validation_bypass' | 'status_change' | 'sla_extension';
    originalValue: string;
    newValue: string;
    justification: string;
  };
  
  metadata: {
    userId: string;
    approvedBy: string;
    ipAddress: string;
  };
}

// Union type for all events
export type DomainEvent = 
  | DropTicketSubmittedEvent
  | AccountValidatedEvent
  | PartyRelationCreatedEvent
  | CarrierRequestSentEvent
  | TransferConfirmedEvent
  | ExchangeCompletedEvent
  | SLAWarningEvent
  | OverrideAppliedEvent;