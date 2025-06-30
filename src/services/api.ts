import { 
  DropTicket, 
  Account, 
  Party, 
  Relation, 
  Carrier, 
  CarrierCommunication, 
  Document, 
  AuditLog,
  Override,
  UserSession
} from '../types';
import { 
  CreateDropTicketRequest, 
  UpdateAccountStatusRequest,
  CreatePartyRequest,
  CreateRelationRequest,
  DropTicketResponse,
  AccountResponse,
  PartyResponse,
  AnalyticsResponse
} from '../types/DTOs';
import { mockData } from '../data/mockData';
import { eventBus, createEvent } from './eventBus';
import { 
  DropTicketSubmittedEvent,
  AccountValidatedEvent,
  PartyRelationCreatedEvent,
  CarrierRequestSentEvent,
  TransferConfirmedEvent,
  ExchangeCompletedEvent,
  SLAWarningEvent,
  OverrideAppliedEvent
} from '../types/Events';

// In-memory data store
class InMemoryDataStore {
  private data = {
    carriers: [...mockData.carriers],
    parties: [...mockData.parties],
    dropTickets: [...mockData.dropTickets],
    accounts: [...mockData.accounts],
    relations: [...mockData.relations],
    communications: [...mockData.communications],
    documents: [...mockData.documents],
    auditLogs: [...mockData.auditLogs],
    userSessions: [...mockData.userSessions],
    overrides: [] as Override[]
  };

  // Generic CRUD operations
  create<T extends { id: string; createdAt: Date; updatedAt: Date }>(
    collection: keyof typeof this.data,
    item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
  ): T {
    const newItem = {
      ...item,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    } as T;

    (this.data[collection] as T[]).push(newItem);
    return newItem;
  }

  read<T>(collection: keyof typeof this.data): T[] {
    return [...(this.data[collection] as T[])];
  }

  findById<T extends { id: string }>(collection: keyof typeof this.data, id: string): T | undefined {
    return (this.data[collection] as T[]).find(item => item.id === id);
  }

  update<T extends { id: string; updatedAt: Date }>(
    collection: keyof typeof this.data,
    id: string,
    updates: Partial<T>
  ): T | null {
    const items = this.data[collection] as T[];
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) return null;

    const updatedItem = {
      ...items[index],
      ...updates,
      updatedAt: new Date()
    };

    items[index] = updatedItem;
    return updatedItem;
  }

  delete(collection: keyof typeof this.data, id: string): boolean {
    const items = this.data[collection] as { id: string }[];
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) return false;

    items.splice(index, 1);
    return true;
  }

  // Query helpers
  findWhere<T>(collection: keyof typeof this.data, predicate: (item: T) => boolean): T[] {
    return (this.data[collection] as T[]).filter(predicate);
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get all data (for debugging)
  getAllData() {
    return { ...this.data };
  }

  // Reset data to initial state
  reset() {
    this.data = {
      carriers: [...mockData.carriers],
      parties: [...mockData.parties],
      dropTickets: [...mockData.dropTickets],
      accounts: [...mockData.accounts],
      relations: [...mockData.relations],
      communications: [...mockData.communications],
      documents: [...mockData.documents],
      auditLogs: [...mockData.auditLogs],
      userSessions: [...mockData.userSessions],
      overrides: []
    };
  }
}

// Singleton data store instance
const dataStore = new InMemoryDataStore();

// Utility functions
const generateTicketNumber = (): string => {
  return `EX${Date.now().toString().slice(-6)}`;
};

const createAuditLogEntry = (
  dropTicketId: string | undefined,
  userId: string,
  action: AuditLog['action'],
  entityType: AuditLog['entityType'],
  entityId: string,
  oldValues?: Record<string, any>,
  newValues?: Record<string, any>,
  reason?: string,
  ipAddress?: string,
  userAgent?: string
): AuditLog => {
  return dataStore.create<AuditLog>('auditLogs', {
    dropTicketId,
    userId,
    action,
    entityType,
    entityId,
    oldValues,
    newValues,
    reason,
    ipAddress,
    userAgent
  });
};

// API Functions

// Drop Ticket Operations
export const getDropTickets = async (): Promise<DropTicket[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return dataStore.read<DropTicket>('dropTickets');
};

export const getDropTicketById = async (id: string): Promise<DropTicket | null> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  return dataStore.findById<DropTicket>('dropTickets', id) || null;
};

export const createDropTicket = async (
  request: CreateDropTicketRequest,
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<DropTicket> => {
  await new Promise(resolve => setTimeout(resolve, 200));

  // Create the drop ticket
  const dropTicket = dataStore.create<DropTicket>('dropTickets', {
    ticketNumber: generateTicketNumber(),
    status: 'submitted',
    priority: 'normal',
    submissionDate: new Date(),
    targetProductType: request.targetProductType,
    targetCarrierId: request.targetCarrierId,
    estimatedValue: request.estimatedValue,
    notes: request.notes,
    createdBy: userId,
    assignedTo: undefined
  });

  // Create parties if they don't exist
  const ownerParty = dataStore.create<Party>('parties', {
    firstName: request.owner.firstName,
    lastName: request.owner.lastName,
    middleName: request.owner.middleName,
    email: request.owner.email,
    phone: request.owner.phone,
    dateOfBirth: request.owner.dateOfBirth ? new Date(request.owner.dateOfBirth) : undefined,
    ssn: request.owner.ssn,
    addressLine1: request.owner.address.line1,
    addressLine2: request.owner.address.line2,
    city: request.owner.address.city,
    state: request.owner.address.state,
    zipCode: request.owner.address.zipCode,
    country: request.owner.address.country
  });

  const insuredParty = dataStore.create<Party>('parties', {
    firstName: request.insured.firstName,
    lastName: request.insured.lastName,
    middleName: request.insured.middleName,
    dateOfBirth: new Date(request.insured.dateOfBirth),
    ssn: request.insured.ssn,
    gender: request.insured.gender
  });

  const agentParty = dataStore.create<Party>('parties', {
    firstName: request.agent.firstName,
    lastName: request.agent.lastName,
    email: request.agent.email,
    phone: request.agent.phone,
    licenseNumber: request.agent.licenseNumber,
    agencyName: request.agent.agencyName,
    agencyAddress: request.agent.agencyAddress
  });

  // Create relations
  const ownerRelation = dataStore.create<Relation>('relations', {
    partyId: ownerParty.id,
    dropTicketId: dropTicket.id,
    relationType: 'owner',
    startDate: new Date(),
    isActive: true
  });

  const insuredRelation = dataStore.create<Relation>('relations', {
    partyId: insuredParty.id,
    dropTicketId: dropTicket.id,
    relationType: 'insured',
    relationshipToOwner: request.insured.relationshipToOwner,
    startDate: new Date(),
    isActive: true
  });

  const agentRelation = dataStore.create<Relation>('relations', {
    partyId: agentParty.id,
    dropTicketId: dropTicket.id,
    relationType: 'agent',
    startDate: new Date(),
    isActive: true
  });

  // Create source accounts
  const sourceAccounts = request.sourceAccounts.map(sourceAccount => 
    dataStore.create<Account>('accounts', {
      dropTicketId: dropTicket.id,
      accountNumber: sourceAccount.accountNumber,
      carrierId: sourceAccount.carrierId,
      accountType: sourceAccount.accountType,
      productName: sourceAccount.productName,
      issueDate: sourceAccount.issueDate ? new Date(sourceAccount.issueDate) : undefined,
      currentValue: sourceAccount.currentValue,
      surrenderValue: sourceAccount.surrenderValue,
      outstandingLoans: sourceAccount.outstandingLoans,
      status: 'pending',
      isSourceAccount: true
    })
  );

  // Create audit log entry
  createAuditLogEntry(
    dropTicket.id,
    userId,
    'create',
    'drop_ticket',
    dropTicket.id,
    undefined,
    {
      status: dropTicket.status,
      targetProductType: dropTicket.targetProductType,
      estimatedValue: dropTicket.estimatedValue,
      sourceAccountCount: sourceAccounts.length
    },
    'Drop ticket submitted',
    ipAddress,
    userAgent
  );

  // Emit domain event
  const event = createEvent<DropTicketSubmittedEvent>({
    eventType: 'DropTicketSubmitted',
    aggregateId: dropTicket.id,
    aggregateType: 'DropTicket',
    data: {
      ticketNumber: dropTicket.ticketNumber,
      submittedBy: userId,
      targetProductType: dropTicket.targetProductType,
      sourceAccountCount: sourceAccounts.length,
      estimatedValue: dropTicket.estimatedValue,
      partiesInvolved: [
        { partyId: ownerParty.id, relationType: 'owner' },
        { partyId: insuredParty.id, relationType: 'insured' },
        { partyId: agentParty.id, relationType: 'agent' }
      ]
    },
    metadata: {}
  }, userId, ipAddress, userAgent);

  eventBus.emit(event);

  return dropTicket;
};

export const updateDropTicketStatus = async (
  id: string,
  status: DropTicket['status'],
  userId: string,
  reason?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<DropTicket | null> => {
  await new Promise(resolve => setTimeout(resolve, 100));

  const existingTicket = dataStore.findById<DropTicket>('dropTickets', id);
  if (!existingTicket) return null;

  const oldStatus = existingTicket.status;
  const updatedTicket = dataStore.update<DropTicket>('dropTickets', id, { status });

  if (updatedTicket) {
    // Create audit log entry
    createAuditLogEntry(
      id,
      userId,
      'update',
      'drop_ticket',
      id,
      { status: oldStatus },
      { status },
      reason || `Status changed from ${oldStatus} to ${status}`,
      ipAddress,
      userAgent
    );

    // Emit completion event if status is completed
    if (status === 'completed') {
      const accounts = dataStore.findWhere<Account>('accounts', acc => acc.dropTicketId === id);
      const totalValue = accounts.reduce((sum, acc) => sum + (acc.currentValue || 0), 0);
      const cycleTimeHours = Math.floor((Date.now() - updatedTicket.submissionDate.getTime()) / (1000 * 60 * 60));

      const event = createEvent<ExchangeCompletedEvent>({
        eventType: 'ExchangeCompleted',
        aggregateId: id,
        aggregateType: 'DropTicket',
        data: {
          ticketNumber: updatedTicket.ticketNumber,
          totalValue,
          cycleTimeHours,
          accountsTransferred: accounts.filter(acc => acc.status === 'transferred').length,
          targetAccountNumber: accounts.find(acc => !acc.isSourceAccount)?.accountNumber
        },
        metadata: {}
      }, userId, ipAddress, userAgent);

      eventBus.emit(event);
    }
  }

  return updatedTicket;
};

// Account Operations
export const getAccounts = async (): Promise<Account[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return dataStore.read<Account>('accounts');
};

export const getAccountById = async (id: string): Promise<Account | null> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  return dataStore.findById<Account>('accounts', id) || null;
};

export const getAccountsByDropTicketId = async (dropTicketId: string): Promise<Account[]> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  return dataStore.findWhere<Account>('accounts', acc => acc.dropTicketId === dropTicketId);
};

export const updateAccountStatus = async (
  request: UpdateAccountStatusRequest,
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<Account | null> => {
  await new Promise(resolve => setTimeout(resolve, 100));

  const existingAccount = dataStore.findById<Account>('accounts', request.accountId);
  if (!existingAccount) return null;

  const oldStatus = existingAccount.status;
  const updatedAccount = dataStore.update<Account>('accounts', request.accountId, {
    status: request.status,
    validationNotes: request.validationNotes,
    currentValue: request.currentValue,
    surrenderValue: request.surrenderValue
  });

  if (updatedAccount) {
    // Create audit log entry
    createAuditLogEntry(
      updatedAccount.dropTicketId,
      userId,
      'update',
      'account',
      request.accountId,
      { status: oldStatus },
      { status: request.status },
      `Account status updated: ${request.validationNotes || 'No notes provided'}`,
      ipAddress,
      userAgent
    );

    // Emit validation event if status is validated
    if (request.status === 'validated') {
      const event = createEvent<AccountValidatedEvent>({
        eventType: 'AccountValidated',
        aggregateId: updatedAccount.dropTicketId,
        aggregateType: 'DropTicket',
        data: {
          accountId: request.accountId,
          accountNumber: updatedAccount.accountNumber,
          carrierId: updatedAccount.carrierId,
          validationResult: 'passed',
          validationNotes: request.validationNotes,
          eligibleFor1035: true
        },
        metadata: {}
      }, userId, ipAddress, userAgent);

      eventBus.emit(event);
    }

    // Emit transfer confirmation if status is confirmed
    if (request.status === 'confirmed') {
      const event = createEvent<TransferConfirmedEvent>({
        eventType: 'TransferConfirmed',
        aggregateId: updatedAccount.dropTicketId,
        aggregateType: 'DropTicket',
        data: {
          accountId: request.accountId,
          accountNumber: updatedAccount.accountNumber,
          carrierId: updatedAccount.carrierId,
          transferValue: updatedAccount.surrenderValue || updatedAccount.currentValue || 0,
          confirmationMethod: 'email',
          confirmationReference: `CONF_${Date.now()}`
        },
        metadata: {}
      }, userId, ipAddress, userAgent);

      eventBus.emit(event);
    }
  }

  return updatedAccount;
};

// Carrier Operations
export const getCarriers = async (): Promise<Carrier[]> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  return dataStore.read<Carrier>('carriers');
};

export const getCarrierById = async (id: string): Promise<Carrier | null> => {
  await new Promise(resolve => setTimeout(resolve, 25));
  return dataStore.findById<Carrier>('carriers', id) || null;
};

// Communication Operations
export const getCommunications = async (): Promise<CarrierCommunication[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return dataStore.read<CarrierCommunication>('communications');
};

export const getCommunicationsByDropTicketId = async (dropTicketId: string): Promise<CarrierCommunication[]> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  return dataStore.findWhere<CarrierCommunication>('communications', comm => comm.dropTicketId === dropTicketId);
};

export const getCommunicationsByAccountId = async (accountId: string): Promise<CarrierCommunication[]> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  return dataStore.findWhere<CarrierCommunication>('communications', comm => comm.accountId === accountId);
};

export const createCarrierCommunication = async (
  dropTicketId: string,
  accountId: string,
  carrierId: string,
  content: string,
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<CarrierCommunication> => {
  await new Promise(resolve => setTimeout(resolve, 150));

  const carrier = await getCarrierById(carrierId);
  const communication = dataStore.create<CarrierCommunication>('communications', {
    dropTicketId,
    accountId,
    carrierId,
    communicationType: 'request',
    method: carrier?.preferredCommunicationMethod || 'email',
    direction: 'outbound',
    subject: `1035 Exchange Request - Account ${accountId}`,
    content,
    status: 'sent',
    sentAt: new Date(),
    slaDeadline: new Date(Date.now() + (carrier?.slaHours || 72) * 60 * 60 * 1000),
    retryCount: 0,
    createdBy: userId
  });

  // Create audit log entry
  createAuditLogEntry(
    dropTicketId,
    userId,
    'communicate',
    'communication',
    communication.id,
    undefined,
    {
      carrierId,
      method: communication.method,
      status: communication.status
    },
    'Carrier communication sent',
    ipAddress,
    userAgent
  );

  // Emit carrier request event
  const event = createEvent<CarrierRequestSentEvent>({
    eventType: 'CarrierRequestSent',
    aggregateId: dropTicketId,
    aggregateType: 'DropTicket',
    data: {
      communicationId: communication.id,
      carrierId,
      accountId,
      method: communication.method,
      slaDeadline: communication.slaDeadline!.toISOString()
    },
    metadata: {}
  }, userId, ipAddress, userAgent);

  eventBus.emit(event);

  return communication;
};

// Document Operations
export const getDocumentsByAccountId = async (accountId: string): Promise<Document[]> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  // For now, return empty array since we don't have account-specific documents in mock data
  // In real implementation, this would filter documents by accountId
  return [];
};

// Party Operations
export const getParties = async (): Promise<Party[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return dataStore.read<Party>('parties');
};

export const getPartyById = async (id: string): Promise<Party | null> => {
  await new Promise(resolve => setTimeout(resolve, 25));
  return dataStore.findById<Party>('parties', id) || null;
};

export const createParty = async (
  request: CreatePartyRequest,
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<Party> => {
  await new Promise(resolve => setTimeout(resolve, 100));

  const party = dataStore.create<Party>('parties', {
    firstName: request.firstName,
    lastName: request.lastName,
    middleName: request.middleName,
    email: request.email,
    phone: request.phone,
    dateOfBirth: request.dateOfBirth ? new Date(request.dateOfBirth) : undefined,
    ssn: request.ssn,
    gender: request.gender,
    addressLine1: request.address?.line1,
    addressLine2: request.address?.line2,
    city: request.address?.city,
    state: request.address?.state,
    zipCode: request.address?.zipCode,
    country: request.address?.country,
    licenseNumber: request.licenseNumber,
    agencyName: request.agencyName,
    agencyAddress: request.agencyAddress,
    department: request.department,
    isActive: true
  });

  // Create user relation if userRole is provided
  if (request.userRole) {
    dataStore.create<Relation>('relations', {
      partyId: party.id,
      relationType: 'user',
      userRole: request.userRole,
      startDate: new Date(),
      isActive: true
    });
  }

  // Create audit log entry
  createAuditLogEntry(
    undefined,
    userId,
    'create',
    'party',
    party.id,
    undefined,
    {
      firstName: party.firstName,
      lastName: party.lastName,
      email: party.email
    },
    'Party created',
    ipAddress,
    userAgent
  );

  return party;
};

// Relation Operations
export const getRelations = async (): Promise<Relation[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return dataStore.read<Relation>('relations');
};

export const getRelationsByDropTicketId = async (dropTicketId: string): Promise<Relation[]> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  return dataStore.findWhere<Relation>('relations', rel => rel.dropTicketId === dropTicketId);
};

export const createRelation = async (
  request: CreateRelationRequest,
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<Relation> => {
  await new Promise(resolve => setTimeout(resolve, 100));

  const relation = dataStore.create<Relation>('relations', {
    partyId: request.partyId,
    dropTicketId: request.dropTicketId,
    accountId: request.accountId,
    relationType: request.relationType,
    relationshipToOwner: request.relationshipToOwner,
    userRole: request.userRole,
    startDate: new Date(request.startDate),
    endDate: request.endDate ? new Date(request.endDate) : undefined,
    isActive: true,
    metadata: request.metadata
  });

  // Create audit log entry
  createAuditLogEntry(
    request.dropTicketId,
    userId,
    'create',
    'relation',
    relation.id,
    undefined,
    {
      partyId: request.partyId,
      relationType: request.relationType,
      userRole: request.userRole
    },
    'Relation created',
    ipAddress,
    userAgent
  );

  // Emit party relation created event
  const event = createEvent<PartyRelationCreatedEvent>({
    eventType: 'PartyRelationCreated',
    aggregateId: request.dropTicketId || request.accountId || relation.id,
    aggregateType: request.dropTicketId ? 'DropTicket' : 'Account',
    data: {
      relationId: relation.id,
      partyId: request.partyId,
      relationType: request.relationType,
      relationshipToOwner: request.relationshipToOwner,
      userRole: request.userRole,
      startDate: request.startDate
    },
    metadata: {}
  }, userId, ipAddress, userAgent);

  eventBus.emit(event);

  return relation;
};

// Audit Operations
export const getAuditLogs = async (): Promise<AuditLog[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return dataStore.read<AuditLog>('auditLogs');
};

export const getAuditLogsByDropTicketId = async (dropTicketId: string): Promise<AuditLog[]> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  return dataStore.findWhere<AuditLog>('auditLogs', log => log.dropTicketId === dropTicketId);
};

export const getAuditLogsByAccountId = async (accountId: string): Promise<AuditLog[]> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  return dataStore.findWhere<AuditLog>('auditLogs', log => 
    log.entityType === 'account' && log.entityId === accountId
  );
};

// Analytics Operations
export const getAnalytics = async (): Promise<AnalyticsResponse> => {
  await new Promise(resolve => setTimeout(resolve, 200));

  const dropTickets = dataStore.read<DropTicket>('dropTickets');
  const accounts = dataStore.read<Account>('accounts');
  const communications = dataStore.read<CarrierCommunication>('communications');

  const completedExchanges = dropTickets.filter(dt => dt.status === 'completed');
  const totalValue = accounts.reduce((sum, acc) => sum + (acc.currentValue || 0), 0);

  // Calculate average cycle time
  const cycleTimeHours = completedExchanges.map(dt => {
    const completionTime = dt.updatedAt.getTime();
    const submissionTime = dt.submissionDate.getTime();
    return (completionTime - submissionTime) / (1000 * 60 * 60);
  });

  const averageCycleTime = cycleTimeHours.length > 0 
    ? cycleTimeHours.reduce((sum, time) => sum + time, 0) / cycleTimeHours.length 
    : 0;

  // Calculate SLA compliance
  const slaCompliantComms = communications.filter(comm => 
    comm.respondedAt && comm.slaDeadline && comm.respondedAt <= comm.slaDeadline
  );
  const slaComplianceRate = communications.length > 0 
    ? (slaCompliantComms.length / communications.length) * 100 
    : 100;

  return {
    summary: {
      totalExchanges: dropTickets.length,
      completedExchanges: completedExchanges.length,
      averageCycleTime: Math.round(averageCycleTime),
      slaComplianceRate: Math.round(slaComplianceRate),
      totalValue: Math.round(totalValue)
    },
    trends: {
      exchangeVolume: [
        { date: '2024-12-01', count: 5, value: 500000 },
        { date: '2024-12-08', count: 8, value: 750000 },
        { date: '2024-12-15', count: 12, value: 1200000 },
        { date: '2024-12-22', count: 15, value: 1500000 }
      ],
      cycleTime: [
        { date: '2024-12-01', averageHours: 96 },
        { date: '2024-12-08', averageHours: 84 },
        { date: '2024-12-15', averageHours: 72 },
        { date: '2024-12-22', averageHours: 68 }
      ],
      carrierPerformance: [
        { carrierId: 'carrier-1', carrierName: 'MetLife Insurance', averageResponseTime: 48, slaComplianceRate: 95 },
        { carrierId: 'carrier-2', carrierName: 'Prudential Financial', averageResponseTime: 36, slaComplianceRate: 98 },
        { carrierId: 'carrier-3', carrierName: 'New York Life', averageResponseTime: 72, slaComplianceRate: 85 },
        { carrierId: 'symetra-financial', carrierName: 'Symetra Financial', averageResponseTime: 42, slaComplianceRate: 96 }
      ]
    },
    statusBreakdown: [
      { status: 'submitted', count: 2, percentage: 13 },
      { status: 'validated', count: 3, percentage: 20 },
      { status: 'in_progress', count: 5, percentage: 33 },
      { status: 'completed', count: 4, percentage: 27 },
      { status: 'cancelled', count: 1, percentage: 7 }
    ]
  };
};

// Utility functions for development
export const resetDataStore = (): void => {
  dataStore.reset();
  eventBus.clearHistory();
};

export const getDataStoreSnapshot = () => {
  return {
    data: dataStore.getAllData(),
    events: eventBus.getEventHistory()
  };
};

// Export the event bus for external use
export { eventBus };