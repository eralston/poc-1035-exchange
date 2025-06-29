import { Address, ProductType, Gender, RelationshipToOwner, UserRole, AccountStatus, RelationType } from './Common';

// Request DTOs
export interface CreateDropTicketRequest {
  targetProductType: ProductType;
  targetCarrierId: string;
  estimatedValue?: number;
  notes?: string;
  
  owner: {
    firstName: string;
    lastName: string;
    middleName?: string;
    dateOfBirth?: string;
    ssn?: string;
    email?: string;
    phone?: string;
    address: Address;
  };
  
  insured: {
    firstName: string;
    lastName: string;
    middleName?: string;
    dateOfBirth: string;
    ssn?: string;
    gender?: Gender;
    relationshipToOwner: RelationshipToOwner;
  };
  
  agent: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    licenseNumber?: string;
    agencyName?: string;
    agencyAddress?: string;
  };
  
  sourceAccounts: Array<{
    accountNumber: string;
    carrierId: string;
    accountType: ProductType;
    productName?: string;
    issueDate?: string;
    currentValue?: number;
    surrenderValue?: number;
    outstandingLoans?: number;
  }>;
}

export interface UpdateAccountStatusRequest {
  accountId: string;
  status: AccountStatus;
  validationNotes?: string;
  currentValue?: number;
  surrenderValue?: number;
}

export interface CreatePartyRequest {
  firstName: string;
  lastName: string;
  middleName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  ssn?: string;
  gender?: Gender;
  address?: Address;
  licenseNumber?: string;
  agencyName?: string;
  agencyAddress?: string;
  department?: string;
  userRole?: UserRole;
}

export interface CreateRelationRequest {
  partyId: string;
  dropTicketId?: string;
  accountId?: string;
  relationType: RelationType;
  relationshipToOwner?: RelationshipToOwner;
  userRole?: UserRole;
  startDate: string;
  endDate?: string;
  metadata?: Record<string, any>;
}

// Response DTOs
export interface CarrierResponse {
  id: string;
  name: string;
  code: string;
  contactEmail?: string;
  contactPhone?: string;
  preferredCommunicationMethod: string;
  slaHours: number;
  isActive: boolean;
}

export interface PartyResponse {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: Gender;
  
  address?: Address;
  
  // Role-specific fields (populated based on context)
  licenseNumber?: string;
  agencyName?: string;
  agencyAddress?: string;
  department?: string;
  isActive?: boolean;
  lastLoginAt?: string;
  
  // Current relations (for context)
  currentRoles?: Array<{
    relationType: string;
    userRole?: string;
    relationshipToOwner?: string;
    startDate: string;
    endDate?: string;
  }>;
  
  createdAt: string;
  updatedAt: string;
}

export interface AccountResponse {
  id: string;
  accountNumber: string;
  carrier: CarrierResponse;
  accountType: ProductType;
  productName?: string;
  issueDate?: string;
  currentValue?: number;
  surrenderValue?: number;
  outstandingLoans?: number;
  status: AccountStatus;
  isSourceAccount: boolean;
  validationNotes?: string;
  
  // Related parties
  owner?: PartyResponse;
  insured?: PartyResponse;
  beneficiaries?: PartyResponse[];
  
  createdAt: string;
  updatedAt: string;
}

export interface CarrierCommunicationResponse {
  id: string;
  communicationType: string;
  method: string;
  direction: string;
  subject?: string;
  content: string;
  status: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  respondedAt?: string;
  slaDeadline?: string;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentResponse {
  id: string;
  filename: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  documentType: string;
  signatureStatus?: string;
  signatureDate?: string;
  uploadedBy: PartyResponse;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogResponse {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  reason?: string;
  user?: PartyResponse;
  createdAt: string;
}

export interface RelationResponse {
  id: string;
  party: PartyResponse;
  relationType: RelationType;
  relationshipToOwner?: RelationshipToOwner;
  userRole?: UserRole;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface DropTicketResponse {
  id: string;
  ticketNumber: string;
  status: string;
  priority: string;
  submissionDate: string;
  targetProductType: ProductType;
  targetCarrier: CarrierResponse;
  estimatedValue?: number;
  notes?: string;
  
  // Parties involved (derived from relations)
  owner: PartyResponse;
  insured: PartyResponse;
  agent: PartyResponse;
  
  sourceAccounts: AccountResponse[];
  targetAccount?: AccountResponse;
  
  communications: CarrierCommunicationResponse[];
  documents: DocumentResponse[];
  auditLog: AuditLogResponse[];
  
  createdBy: PartyResponse;
  assignedTo?: PartyResponse;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsResponse {
  summary: {
    totalExchanges: number;
    completedExchanges: number;
    averageCycleTime: number;
    slaComplianceRate: number;
    totalValue: number;
  };
  
  trends: {
    exchangeVolume: Array<{
      date: string;
      count: number;
      value: number;
    }>;
    cycleTime: Array<{
      date: string;
      averageHours: number;
    }>;
    carrierPerformance: Array<{
      carrierId: string;
      carrierName: string;
      averageResponseTime: number;
      slaComplianceRate: number;
    }>;
  };
  
  statusBreakdown: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
}