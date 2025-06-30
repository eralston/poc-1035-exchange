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
  ExchangeMetrics,
  UserSession 
} from '../types';

// Generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Generate ticket numbers
const generateTicketNumber = () => `EX${Date.now().toString().slice(-6)}`;

// Mock Carriers
export const mockCarriers: Carrier[] = [
  {
    id: 'carrier-1',
    name: 'MetLife Insurance',
    code: 'MET',
    contactEmail: 'exchanges@metlife.com',
    contactPhone: '1-800-638-5433',
    preferredCommunicationMethod: 'email',
    apiEndpoint: 'https://api.metlife.com/exchanges',
    slaHours: 72,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'carrier-2',
    name: 'Prudential Financial',
    code: 'PRU',
    contactEmail: 'policy.services@prudential.com',
    contactPhone: '1-800-778-2255',
    preferredCommunicationMethod: 'api',
    apiEndpoint: 'https://api.prudential.com/policy-exchange',
    slaHours: 48,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'carrier-3',
    name: 'New York Life',
    code: 'NYL',
    contactEmail: 'exchanges@newyorklife.com',
    contactPhone: '1-800-225-5695',
    preferredCommunicationMethod: 'fax',
    slaHours: 96,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'carrier-4',
    name: 'Pacific Life',
    code: 'PAC',
    contactEmail: 'customer.service@pacificlife.com',
    contactPhone: '1-800-800-7681',
    preferredCommunicationMethod: 'email',
    slaHours: 72,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'artemis-financial',
    name: 'Artemis Financial',
    code: 'SYM',
    contactEmail: 'exchanges@artemis.com',
    contactPhone: '1-800-796-3872',
    preferredCommunicationMethod: 'api',
    apiEndpoint: 'https://api.artemis.com/exchanges',
    slaHours: 48,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// Mock Parties (People in various roles)
export const mockParties: Party[] = [
  // Agents
  {
    id: 'party-agent-1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@insuranceagency.com',
    phone: '555-0123',
    licenseNumber: 'AG123456',
    agencyName: 'Johnson Insurance Services',
    agencyAddress: '123 Main St, Anytown, ST 12345',
    isActive: true,
    department: 'Sales',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'party-agent-2',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@premierinsurance.com',
    phone: '555-0124',
    licenseNumber: 'AG789012',
    agencyName: 'Premier Insurance Group',
    agencyAddress: '456 Oak Ave, Business City, ST 67890',
    isActive: true,
    department: 'Sales',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  // Policy Owners
  {
    id: 'party-owner-1',
    firstName: 'Robert',
    lastName: 'Williams',
    middleName: 'James',
    email: 'robert.williams@email.com',
    phone: '555-0201',
    dateOfBirth: new Date('1965-03-15'),
    ssn: 'encrypted_ssn_001',
    addressLine1: '789 Elm Street',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62701',
    country: 'USA',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: 'party-owner-2',
    firstName: 'Jennifer',
    lastName: 'Davis',
    email: 'jennifer.davis@email.com',
    phone: '555-0202',
    dateOfBirth: new Date('1972-08-22'),
    ssn: 'encrypted_ssn_002',
    addressLine1: '321 Pine Road',
    city: 'Madison',
    state: 'WI',
    zipCode: '53703',
    country: 'USA',
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-05')
  },
  // Insured Parties
  {
    id: 'party-insured-1',
    firstName: 'Robert',
    lastName: 'Williams',
    middleName: 'James',
    dateOfBirth: new Date('1965-03-15'),
    ssn: 'encrypted_ssn_001',
    gender: 'male',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: 'party-insured-2',
    firstName: 'Jennifer',
    lastName: 'Davis',
    dateOfBirth: new Date('1972-08-22'),
    ssn: 'encrypted_ssn_002',
    gender: 'female',
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-05')
  },
  // System Users
  {
    id: 'party-admin-1',
    firstName: 'Lisa',
    lastName: 'Anderson',
    email: 'lisa.anderson@company.com',
    phone: '555-0301',
    department: 'Home Office Operations',
    isActive: true,
    lastLoginAt: new Date('2024-12-20T09:30:00Z'),
    mfaEnabled: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-20')
  },
  {
    id: 'party-ops-1',
    firstName: 'David',
    lastName: 'Martinez',
    email: 'david.martinez@company.com',
    phone: '555-0302',
    department: 'Operations',
    isActive: true,
    lastLoginAt: new Date('2024-12-20T08:15:00Z'),
    mfaEnabled: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-20')
  }
];

// Mock Drop Tickets
export const mockDropTickets: DropTicket[] = [
  {
    id: 'drop-ticket-1',
    ticketNumber: generateTicketNumber(),
    status: 'in_progress',
    priority: 'normal',
    submissionDate: new Date('2024-12-15T10:30:00Z'),
    targetProductType: 'annuity',
    targetCarrierId: 'artemis-financial',
    estimatedValue: 125000,
    notes: 'Client looking to consolidate multiple policies into single annuity',
    createdBy: 'party-agent-1',
    assignedTo: 'party-admin-1',
    createdAt: new Date('2024-12-15T10:30:00Z'),
    updatedAt: new Date('2024-12-18T14:20:00Z')
  },
  {
    id: 'drop-ticket-2',
    ticketNumber: generateTicketNumber(),
    status: 'validated',
    priority: 'high',
    submissionDate: new Date('2024-12-18T09:15:00Z'),
    targetProductType: 'life_insurance',
    targetCarrierId: 'artemis-financial',
    estimatedValue: 75000,
    notes: 'Urgent request - client needs completion by year end',
    createdBy: 'party-agent-2',
    assignedTo: 'party-admin-1',
    createdAt: new Date('2024-12-18T09:15:00Z'),
    updatedAt: new Date('2024-12-19T11:45:00Z')
  },
  {
    id: 'drop-ticket-3',
    ticketNumber: generateTicketNumber(),
    status: 'completed',
    priority: 'normal',
    submissionDate: new Date('2024-12-10T14:20:00Z'),
    targetProductType: 'annuity',
    targetCarrierId: 'symetra-financial',
    estimatedValue: 200000,
    notes: 'Standard 1035 exchange completed successfully',
    createdBy: 'party-agent-1',
    assignedTo: 'party-admin-1',
    createdAt: new Date('2024-12-10T14:20:00Z'),
    updatedAt: new Date('2024-12-17T16:30:00Z')
  }
];

// Mock Accounts (Source and Target Policies)
export const mockAccounts: Account[] = [
  // Source accounts for drop-ticket-1
  {
    id: 'account-1',
    dropTicketId: 'drop-ticket-1',
    accountNumber: 'MET-POL-123456',
    carrierId: 'carrier-1',
    accountType: 'life_insurance',
    productName: 'MetLife Whole Life Plus',
    issueDate: new Date('2015-06-15'),
    currentValue: 85000,
    surrenderValue: 82000,
    outstandingLoans: 5000,
    status: 'awaiting_carrier',
    isSourceAccount: true,
    validationNotes: 'Policy in good standing, eligible for 1035 exchange',
    createdAt: new Date('2024-12-15T10:30:00Z'),
    updatedAt: new Date('2024-12-18T14:20:00Z')
  },
  {
    id: 'account-2',
    dropTicketId: 'drop-ticket-1',
    accountNumber: 'PRU-ANN-789012',
    carrierId: 'carrier-2',
    accountType: 'annuity',
    productName: 'Prudential Fixed Annuity',
    issueDate: new Date('2018-03-20'),
    currentValue: 45000,
    surrenderValue: 43000,
    outstandingLoans: 0,
    status: 'confirmed',
    isSourceAccount: true,
    validationNotes: 'Annuity past surrender charge period',
    createdAt: new Date('2024-12-15T10:30:00Z'),
    updatedAt: new Date('2024-12-17T09:15:00Z')
  },
  // Target account for drop-ticket-1
  {
    id: 'account-3',
    dropTicketId: 'drop-ticket-1',
    accountNumber: 'SYM-ANN-NEW001',
    carrierId: 'symetra-financial',
    accountType: 'annuity',
    productName: 'Symetra Variable Annuity',
    currentValue: 0,
    surrenderValue: 0,
    outstandingLoans: 0,
    status: 'pending',
    isSourceAccount: false,
    validationNotes: 'Target policy application in underwriting',
    createdAt: new Date('2024-12-15T10:30:00Z'),
    updatedAt: new Date('2024-12-18T14:20:00Z')
  },
  // Source account for drop-ticket-2
  {
    id: 'account-4',
    dropTicketId: 'drop-ticket-2',
    accountNumber: 'NYL-POL-345678',
    carrierId: 'carrier-3',
    accountType: 'life_insurance',
    productName: 'New York Life Universal Life',
    issueDate: new Date('2010-11-30'),
    currentValue: 75000,
    surrenderValue: 72000,
    outstandingLoans: 0,
    status: 'validated',
    isSourceAccount: true,
    validationNotes: 'Policy validated, ready for carrier communication',
    createdAt: new Date('2024-12-18T09:15:00Z'),
    updatedAt: new Date('2024-12-19T11:45:00Z')
  }
];

// Mock Relations (connecting parties to drop tickets and accounts)
export const mockRelations: Relation[] = [
  // Relations for drop-ticket-1
  {
    id: 'relation-1',
    partyId: 'party-owner-1',
    dropTicketId: 'drop-ticket-1',
    relationType: 'owner',
    startDate: new Date('2024-12-15T10:30:00Z'),
    isActive: true,
    createdAt: new Date('2024-12-15T10:30:00Z'),
    updatedAt: new Date('2024-12-15T10:30:00Z')
  },
  {
    id: 'relation-2',
    partyId: 'party-insured-1',
    dropTicketId: 'drop-ticket-1',
    relationType: 'insured',
    relationshipToOwner: 'self',
    startDate: new Date('2024-12-15T10:30:00Z'),
    isActive: true,
    createdAt: new Date('2024-12-15T10:30:00Z'),
    updatedAt: new Date('2024-12-15T10:30:00Z')
  },
  {
    id: 'relation-3',
    partyId: 'party-agent-1',
    dropTicketId: 'drop-ticket-1',
    relationType: 'agent',
    startDate: new Date('2024-12-15T10:30:00Z'),
    isActive: true,
    createdAt: new Date('2024-12-15T10:30:00Z'),
    updatedAt: new Date('2024-12-15T10:30:00Z')
  },
  // Relations for drop-ticket-2
  {
    id: 'relation-4',
    partyId: 'party-owner-2',
    dropTicketId: 'drop-ticket-2',
    relationType: 'owner',
    startDate: new Date('2024-12-18T09:15:00Z'),
    isActive: true,
    createdAt: new Date('2024-12-18T09:15:00Z'),
    updatedAt: new Date('2024-12-18T09:15:00Z')
  },
  {
    id: 'relation-5',
    partyId: 'party-insured-2',
    dropTicketId: 'drop-ticket-2',
    relationType: 'insured',
    relationshipToOwner: 'self',
    startDate: new Date('2024-12-18T09:15:00Z'),
    isActive: true,
    createdAt: new Date('2024-12-18T09:15:00Z'),
    updatedAt: new Date('2024-12-18T09:15:00Z')
  },
  {
    id: 'relation-6',
    partyId: 'party-agent-2',
    dropTicketId: 'drop-ticket-2',
    relationType: 'agent',
    startDate: new Date('2024-12-18T09:15:00Z'),
    isActive: true,
    createdAt: new Date('2024-12-18T09:15:00Z'),
    updatedAt: new Date('2024-12-18T09:15:00Z')
  },
  // User relations
  {
    id: 'relation-7',
    partyId: 'party-admin-1',
    relationType: 'user',
    userRole: 'home_office_admin',
    startDate: new Date('2024-01-01'),
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'relation-8',
    partyId: 'party-ops-1',
    relationType: 'user',
    userRole: 'operations_staff',
    startDate: new Date('2024-01-01'),
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// Mock Communications
export const mockCommunications: CarrierCommunication[] = [
  {
    id: 'comm-1',
    dropTicketId: 'drop-ticket-1',
    accountId: 'account-1',
    carrierId: 'carrier-1',
    communicationType: 'request',
    method: 'email',
    direction: 'outbound',
    subject: '1035 Exchange Request - Policy MET-POL-123456',
    content: 'We are requesting a 1035 exchange for the above policy. Please provide surrender value and transfer instructions.',
    status: 'sent',
    sentAt: new Date('2024-12-16T10:00:00Z'),
    slaDeadline: new Date('2024-12-19T10:00:00Z'),
    retryCount: 0,
    createdBy: 'party-ops-1',
    createdAt: new Date('2024-12-16T10:00:00Z'),
    updatedAt: new Date('2024-12-16T10:00:00Z')
  },
  {
    id: 'comm-2',
    dropTicketId: 'drop-ticket-1',
    accountId: 'account-2',
    carrierId: 'carrier-2',
    communicationType: 'response',
    method: 'api',
    direction: 'inbound',
    subject: 'Re: 1035 Exchange Request - Annuity PRU-ANN-789012',
    content: 'Exchange approved. Surrender value: $43,000. Transfer will be completed within 5 business days.',
    status: 'responded',
    sentAt: new Date('2024-12-17T14:30:00Z'),
    respondedAt: new Date('2024-12-17T14:30:00Z'),
    retryCount: 0,
    createdAt: new Date('2024-12-17T14:30:00Z'),
    updatedAt: new Date('2024-12-17T14:30:00Z')
  }
];

// Mock Documents
export const mockDocuments: Document[] = [
  {
    id: 'doc-1',
    dropTicketId: 'drop-ticket-1',
    filename: 'application_robert_williams.pdf',
    originalFilename: 'Symetra Application - Robert Williams.pdf',
    fileSize: 2048576,
    mimeType: 'application/pdf',
    documentType: 'application',
    storagePath: '/documents/drop-ticket-1/application_robert_williams.pdf',
    checksum: 'sha256:abc123def456',
    isEncrypted: true,
    uploadedBy: 'party-agent-1',
    signatureStatus: 'signed',
    signatureDate: new Date('2024-12-15T16:45:00Z'),
    createdAt: new Date('2024-12-15T11:00:00Z'),
    updatedAt: new Date('2024-12-15T16:45:00Z')
  },
  {
    id: 'doc-2',
    dropTicketId: 'drop-ticket-1',
    filename: 'policy_statement_met_123456.pdf',
    originalFilename: 'MetLife Policy Statement.pdf',
    fileSize: 1024768,
    mimeType: 'application/pdf',
    documentType: 'policy_statement',
    storagePath: '/documents/drop-ticket-1/policy_statement_met_123456.pdf',
    checksum: 'sha256:def456ghi789',
    isEncrypted: true,
    uploadedBy: 'party-agent-1',
    signatureStatus: 'not_required',
    createdAt: new Date('2024-12-15T11:15:00Z'),
    updatedAt: new Date('2024-12-15T11:15:00Z')
  }
];

// Mock Audit Logs
export const mockAuditLogs: AuditLog[] = [
  {
    id: 'audit-1',
    dropTicketId: 'drop-ticket-1',
    userId: 'party-agent-1',
    action: 'create',
    entityType: 'drop_ticket',
    entityId: 'drop-ticket-1',
    newValues: {
      status: 'submitted',
      targetProductType: 'annuity',
      estimatedValue: 125000
    },
    reason: 'Initial drop ticket submission',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    createdAt: new Date('2024-12-15T10:30:00Z')
  },
  {
    id: 'audit-2',
    dropTicketId: 'drop-ticket-1',
    userId: 'party-admin-1',
    action: 'update',
    entityType: 'drop_ticket',
    entityId: 'drop-ticket-1',
    oldValues: { status: 'submitted' },
    newValues: { status: 'validated' },
    reason: 'Validation completed successfully',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    createdAt: new Date('2024-12-16T09:15:00Z')
  },
  {
    id: 'audit-3',
    dropTicketId: 'drop-ticket-1',
    userId: 'party-ops-1',
    action: 'communicate',
    entityType: 'communication',
    entityId: 'comm-1',
    newValues: {
      carrierId: 'carrier-1',
      method: 'email',
      status: 'sent'
    },
    reason: 'Carrier communication sent',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    createdAt: new Date('2024-12-16T10:00:00Z')
  }
];

// Mock User Sessions
export const mockUserSessions: UserSession[] = [
  {
    id: 'session-1',
    userId: 'party-admin-1',
    sessionToken: 'sess_abc123def456ghi789',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    expiresAt: new Date('2024-12-21T09:30:00Z'),
    createdAt: new Date('2024-12-20T09:30:00Z'),
    updatedAt: new Date('2024-12-20T09:30:00Z')
  },
  {
    id: 'session-2',
    userId: 'party-ops-1',
    sessionToken: 'sess_def456ghi789jkl012',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    expiresAt: new Date('2024-12-21T08:15:00Z'),
    createdAt: new Date('2024-12-20T08:15:00Z'),
    updatedAt: new Date('2024-12-20T08:15:00Z')
  }
];

// Export all mock data collections
export const mockData = {
  carriers: mockCarriers,
  parties: mockParties,
  dropTickets: mockDropTickets,
  accounts: mockAccounts,
  relations: mockRelations,
  communications: mockCommunications,
  documents: mockDocuments,
  auditLogs: mockAuditLogs,
  userSessions: mockUserSessions
};