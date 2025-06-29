# 📊 Data Schema Specification

This document defines the complete data architecture for the 1035 Exchange Workflow Management System using TypeScript classes, data transfer objects (DTOs), and event schemas that support the end-to-end exchange process.

## 🏗️ Core Entity Classes

### Primary Entities

#### `DropTicket`
The root aggregate representing a complete 1035 exchange request.

```typescript
class DropTicket {
  id: string;
  ticketNumber: string; // Human-readable identifier
  status: 'submitted' | 'validated' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  submissionDate: Date;
  targetProductType: 'life_insurance' | 'annuity';
  targetCarrierId: string;
  estimatedValue?: number;
  notes?: string;
  createdBy: string; // User ID
  assignedTo?: string; // User ID
  createdAt: Date;
  updatedAt: Date;

  // Navigation properties
  targetCarrier?: Carrier;
  accounts?: Account[]; // Source and target accounts
  relations?: Relation[]; // All parties involved
  communications?: CarrierCommunication[];
  documents?: Document[];
  auditLogs?: AuditLog[];
  overrides?: Override[];
}
```

#### `Account`
Represents a security in the system (Life insurance policy or annuity investment).

```typescript
class Account {
  id: string;
  dropTicketId: string;
  accountNumber: string; // Policy number or account number
  carrierId: string;
  accountType: 'life_insurance' | 'annuity';
  productName?: string;
  issueDate?: Date;
  currentValue?: number;
  surrenderValue?: number;
  outstandingLoans?: number;
  status: 'pending' | 'validated' | 'awaiting_carrier' | 'confirmed' | 'transferred';
  isSourceAccount: boolean; // true for source, false for target
  validationNotes?: string;
  createdAt: Date;
  updatedAt: Date;

  // Navigation properties
  dropTicket?: DropTicket;
  carrier?: Carrier;
  relations?: Relation[]; // All parties related to this account
  communications?: CarrierCommunication[];
}
```

#### `Party`
Represents any person interacting with the system, with optional fields for all possible roles.

```typescript
class Party {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email?: string;
  phone?: string;
  
  // Optional fields - union of all role requirements
  dateOfBirth?: Date; // Required for insured, optional for others
  ssn?: string; // Encrypted - required for owner/insured
  gender?: 'male' | 'female' | 'other'; // For insured parties
  
  // Address fields
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  
  // Agent-specific fields
  licenseNumber?: string;
  agencyName?: string;
  agencyAddress?: string;
  
  // User-specific fields
  passwordHash?: string;
  department?: string;
  isActive?: boolean;
  lastLoginAt?: Date;
  passwordChangedAt?: Date;
  mfaEnabled?: boolean;
  mfaSecret?: string; // Encrypted
  
  createdAt: Date;
  updatedAt: Date;

  // Navigation properties
  relations?: Relation[];
  userSessions?: UserSession[];
  auditLogs?: AuditLog[];
}
```

#### `Relation`
Normalized table indicating the type of role a Party has relative to an Account or DropTicket.

```typescript
class Relation {
  id: string;
  partyId: string;
  dropTicketId?: string; // For drop-ticket level relations
  accountId?: string; // For account-specific relations
  relationType: 'owner' | 'insured' | 'agent' | 'beneficiary' | 'user' | 'carrier_rep';
  relationshipToOwner?: 'self' | 'spouse' | 'child' | 'other'; // For insured parties
  userRole?: 'agent' | 'home_office_admin' | 'operations_staff' | 'system_admin'; // For user relations
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  metadata?: Record<string, any>; // Role-specific metadata
  createdAt: Date;
  updatedAt: Date;

  // Navigation properties
  party?: Party;
  dropTicket?: DropTicket;
  account?: Account;
}
```

#### `Carrier`
Insurance companies involved in exchanges.

```typescript
class Carrier {
  id: string;
  name: string;
  code: string; // Short identifier
  contactEmail?: string;
  contactPhone?: string;
  preferredCommunicationMethod: 'email' | 'fax' | 'api' | 'portal';
  apiEndpoint?: string;
  apiKey?: string; // Encrypted
  slaHours: number; // Standard response time
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Navigation properties
  accounts?: Account[];
  communications?: CarrierCommunication[];
}
```

### Communication & Workflow Classes

#### `CarrierCommunication`
All communications with external carriers.

```typescript
class CarrierCommunication {
  id: string;
  dropTicketId: string;
  accountId?: string;
  carrierId: string;
  communicationType: 'request' | 'response' | 'reminder' | 'escalation';
  method: 'email' | 'fax' | 'api' | 'phone';
  direction: 'outbound' | 'inbound';
  subject?: string;
  content: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'responded' | 'failed';
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  respondedAt?: Date;
  slaDeadline?: Date;
  retryCount: number;
  createdBy?: string; // User ID
  createdAt: Date;
  updatedAt: Date;

  // Navigation properties
  dropTicket?: DropTicket;
  account?: Account;
  carrier?: Carrier;
  createdByUser?: Party;
}
```

#### `Document`
All documents associated with exchanges.

```typescript
class Document {
  id: string;
  dropTicketId: string;
  filename: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  documentType: 'application' | 'policy_statement' | 'id_verification' | 'signature_page';
  storagePath: string;
  checksum: string;
  isEncrypted: boolean;
  uploadedBy: string; // User ID
  signatureStatus?: 'not_required' | 'pending' | 'signed' | 'rejected';
  signatureDate?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Navigation properties
  dropTicket?: DropTicket;
  uploadedByUser?: Party;
}
```

### Session Management

#### `UserSession`
Active user sessions for security tracking.

```typescript
class UserSession {
  id: string;
  userId: string; // Party ID where relationType = 'user'
  sessionToken: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: Date;
  createdAt: Date;

  // Navigation properties
  user?: Party;
}
```

### Audit & Compliance Classes

#### `AuditLog`
Complete audit trail of all system actions.

```typescript
class AuditLog {
  id: string;
  dropTicketId?: string;
  userId?: string; // Party ID
  action: 'create' | 'update' | 'delete' | 'approve' | 'override' | 'communicate';
  entityType: 'drop_ticket' | 'account' | 'communication' | 'document' | 'party' | 'relation';
  entityId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;

  // Navigation properties
  dropTicket?: DropTicket;
  user?: Party;
}
```

#### `Override`
Manual administrative overrides with justification.

```typescript
class Override {
  id: string;
  dropTicketId: string;
  overrideType: 'validation_bypass' | 'status_change' | 'sla_extension';
  originalValue?: string;
  newValue?: string;
  justification: string;
  approvedBy: string; // User ID
  approvalDate: Date;
  createdAt: Date;

  // Navigation properties
  dropTicket?: DropTicket;
  approvedByUser?: Party;
}
```

### Analytics Classes

#### `ExchangeMetrics`
Aggregated metrics for analytics and reporting.

```typescript
class ExchangeMetrics {
  id: string;
  dropTicketId: string;
  metricDate: Date;
  cycleTimeHours?: number;
  slaBreaches: number;
  carrierResponseTimeHours?: number;
  totalValue?: number;
  accountCount: number;
  overrideCount: number;
  createdAt: Date;

  // Navigation properties
  dropTicket?: DropTicket;
}
```

---

## 📋 Data Transfer Objects (DTOs)

### Request DTOs

#### `CreateDropTicketRequest`
```typescript
interface CreateDropTicketRequest {
  targetProductType: 'life_insurance' | 'annuity';
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
    address: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      zipCode: string;
      country?: string;
    };
  };
  
  insured: {
    firstName: string;
    lastName: string;
    middleName?: string;
    dateOfBirth: string;
    ssn?: string;
    gender?: 'male' | 'female' | 'other';
    relationshipToOwner: 'self' | 'spouse' | 'child' | 'other';
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
    accountType: 'life_insurance' | 'annuity';
    productName?: string;
    issueDate?: string;
    currentValue?: number;
    surrenderValue?: number;
    outstandingLoans?: number;
  }>;
}
```

#### `UpdateAccountStatusRequest`
```typescript
interface UpdateAccountStatusRequest {
  accountId: string;
  status: 'pending' | 'validated' | 'awaiting_carrier' | 'confirmed' | 'transferred';
  validationNotes?: string;
  currentValue?: number;
  surrenderValue?: number;
}
```

#### `CreatePartyRequest`
```typescript
interface CreatePartyRequest {
  firstName: string;
  lastName: string;
  middleName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  ssn?: string;
  gender?: 'male' | 'female' | 'other';
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
  licenseNumber?: string;
  agencyName?: string;
  agencyAddress?: string;
  department?: string;
  userRole?: 'agent' | 'home_office_admin' | 'operations_staff' | 'system_admin';
}
```

#### `CreateRelationRequest`
```typescript
interface CreateRelationRequest {
  partyId: string;
  dropTicketId?: string;
  accountId?: string;
  relationType: 'owner' | 'insured' | 'agent' | 'beneficiary' | 'user' | 'carrier_rep';
  relationshipToOwner?: 'self' | 'spouse' | 'child' | 'other';
  userRole?: 'agent' | 'home_office_admin' | 'operations_staff' | 'system_admin';
  startDate: string;
  endDate?: string;
  metadata?: Record<string, any>;
}
```

### Response DTOs

#### `DropTicketResponse`
```typescript
interface DropTicketResponse {
  id: string;
  ticketNumber: string;
  status: 'submitted' | 'validated' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  submissionDate: string;
  targetProductType: 'life_insurance' | 'annuity';
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
```

#### `AccountResponse`
```typescript
interface AccountResponse {
  id: string;
  accountNumber: string;
  carrier: CarrierResponse;
  accountType: 'life_insurance' | 'annuity';
  productName?: string;
  issueDate?: string;
  currentValue?: number;
  surrenderValue?: number;
  outstandingLoans?: number;
  status: 'pending' | 'validated' | 'awaiting_carrier' | 'confirmed' | 'transferred';
  isSourceAccount: boolean;
  validationNotes?: string;
  
  // Related parties
  owner?: PartyResponse;
  insured?: PartyResponse;
  beneficiaries?: PartyResponse[];
  
  createdAt: string;
  updatedAt: string;
}
```

#### `PartyResponse`
```typescript
interface PartyResponse {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
  
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
```

#### `RelationResponse`
```typescript
interface RelationResponse {
  id: string;
  party: PartyResponse;
  dropTicket?: DropTicketResponse;
  account?: AccountResponse;
  relationType: 'owner' | 'insured' | 'agent' | 'beneficiary' | 'user' | 'carrier_rep';
  relationshipToOwner?: 'self' | 'spouse' | 'child' | 'other';
  userRole?: 'agent' | 'home_office_admin' | 'operations_staff' | 'system_admin';
  startDate: string;
  endDate?: string;
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
```

#### `AnalyticsResponse`
```typescript
interface AnalyticsResponse {
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
```

---

## 🔄 Event Schemas

### Domain Events

#### `DropTicketSubmitted`
```typescript
interface DropTicketSubmittedEvent {
  eventId: string;
  eventType: 'DropTicketSubmitted';
  aggregateId: string; // drop_ticket_id
  aggregateType: 'DropTicket';
  version: number;
  timestamp: string;
  
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
  
  metadata: {
    userId: string;
    ipAddress: string;
    userAgent: string;
  };
}
```

#### `AccountValidated`
```typescript
interface AccountValidatedEvent {
  eventId: string;
  eventType: 'AccountValidated';
  aggregateId: string; // drop_ticket_id
  aggregateType: 'DropTicket';
  version: number;
  timestamp: string;
  
  data: {
    accountId: string;
    accountNumber: string;
    carrierId: string;
    validationResult: 'passed' | 'failed';
    validationNotes?: string;
    eligibleFor1035: boolean;
  };
  
  metadata: {
    userId: string;
    validatedBy: string;
  };
}
```

#### `PartyRelationCreated`
```typescript
interface PartyRelationCreatedEvent {
  eventId: string;
  eventType: 'PartyRelationCreated';
  aggregateId: string; // drop_ticket_id or account_id
  aggregateType: 'DropTicket' | 'Account';
  version: number;
  timestamp: string;
  
  data: {
    relationId: string;
    partyId: string;
    relationType: 'owner' | 'insured' | 'agent' | 'beneficiary' | 'user' | 'carrier_rep';
    relationshipToOwner?: string;
    userRole?: string;
    startDate: string;
  };
  
  metadata: {
    userId: string;
    createdBy: string;
  };
}
```

#### `CarrierRequestSent`
```typescript
interface CarrierRequestSentEvent {
  eventId: string;
  eventType: 'CarrierRequestSent';
  aggregateId: string; // drop_ticket_id
  aggregateType: 'DropTicket';
  version: number;
  timestamp: string;
  
  data: {
    communicationId: string;
    carrierId: string;
    accountId: string;
    method: 'email' | 'fax' | 'api' | 'phone';
    slaDeadline: string;
  };
  
  metadata: {
    userId: string;
    sentBy: string;
  };
}
```

#### `TransferConfirmed`
```typescript
interface TransferConfirmedEvent {
  eventId: string;
  eventType: 'TransferConfirmed';
  aggregateId: string; // drop_ticket_id
  aggregateType: 'DropTicket';
  version: number;
  timestamp: string;
  
  data: {
    accountId: string;
    accountNumber: string;
    carrierId: string;
    transferValue: number;
    confirmationMethod: 'email' | 'api' | 'fax';
    confirmationReference?: string;
  };
  
  metadata: {
    confirmedBy: string;
    confirmationDate: string;
  };
}
```

#### `ExchangeCompleted`
```typescript
interface ExchangeCompletedEvent {
  eventId: string;
  eventType: 'ExchangeCompleted';
  aggregateId: string; // drop_ticket_id
  aggregateType: 'DropTicket';
  version: number;
  timestamp: string;
  
  data: {
    ticketNumber: string;
    totalValue: number;
    cycleTimeHours: number;
    accountsTransferred: number;
    targetAccountNumber?: string;
  };
  
  metadata: {
    completedBy: string;
    completionDate: string;
  };
}
```

### System Events

#### `SLAWarning`
```typescript
interface SLAWarningEvent {
  eventId: string;
  eventType: 'SLAWarning';
  aggregateId: string;
  aggregateType: 'CarrierCommunication';
  version: number;
  timestamp: string;
  
  data: {
    communicationId: string;
    carrierId: string;
    dropTicketId: string;
    hoursUntilBreach: number;
    warningLevel: 'yellow' | 'red';
  };
  
  metadata: {
    triggeredBy: 'system';
  };
}
```

#### `OverrideApplied`
```typescript
interface OverrideAppliedEvent {
  eventId: string;
  eventType: 'OverrideApplied';
  aggregateId: string; // drop_ticket_id
  aggregateType: 'DropTicket';
  version: number;
  timestamp: string;
  
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
```

---

## 🔐 Role-Based Access Control

### User Roles and Permissions

The system uses the `Relation` entity to manage roles dynamically. A Party can have multiple relations with different role types.

#### Role Types in Relations

##### `Agent` (relationType: 'user', userRole: 'agent')
**Capabilities:**
- Create and submit drop tickets
- View own drop tickets and their status
- Upload required documents
- Receive notifications about exchange progress

**Data Access:**
- Read: Own drop tickets, associated accounts, communications, documents
- Write: Create drop tickets, upload documents
- Restricted: Cannot access other agents' data, system administration

##### `HomeOfficeAdmin` (relationType: 'user', userRole: 'home_office_admin')
**Capabilities:**
- Review and approve drop tickets
- Validate account information
- Apply manual overrides with justification
- Access compliance reports
- Manage document signatures

**Data Access:**
- Read: All drop tickets, accounts, communications, audit logs
- Write: Update drop ticket status, apply overrides, create audit entries
- Restricted: User management, system configuration

##### `OperationsStaff` (relationType: 'user', userRole: 'operations_staff')
**Capabilities:**
- Monitor SLA compliance
- Manage carrier communications
- Handle escalations
- Generate operational reports
- Track exchange metrics

**Data Access:**
- Read: All operational data, communications, SLA metrics
- Write: Create communications, update SLA deadlines, escalate issues
- Restricted: Financial data, user management

##### `SystemAdmin` (relationType: 'user', userRole: 'system_admin')
**Capabilities:**
- Full system access
- User management and role assignment
- System configuration
- Audit log access
- Integration management

**Data Access:**
- Read: All system data including audit logs, user sessions
- Write: All system operations, user management, configuration
- Restricted: None (full access)

### Permission Matrix

| Resource | Agent | HomeOfficeAdmin | OperationsStaff | SystemAdmin |
|----------|-------|-----------------|-----------------|-------------|
| Drop Tickets (Own) | CRUD | R | R | CRUD |
| Drop Tickets (All) | - | CRUD | R | CRUD |
| Accounts | R (Own) | CRUD | R | CRUD |
| Communications | R (Own) | CRUD | CRUD | CRUD |
| Documents | CRU (Own) | CRUD | R | CRUD |
| Parties | R (Self) | R | R | CRUD |
| Relations | R (Own) | CRUD | R | CRUD |
| Audit Logs | - | R | R (Limited) | CRUD |
| Overrides | - | CRUD | R | CRUD |
| Analytics | - | R | CRUD | CRUD |
| System Config | - | - | - | CRUD |

**Legend:** C=Create, R=Read, U=Update, D=Delete

---

## 📈 Data Relationships and Constraints

### Key Relationships
- **DropTicket** → **Account** (1:Many)
- **Account** → **Carrier** (Many:1)
- **Party** → **Relation** (1:Many)
- **Relation** → **DropTicket** (Many:1, optional)
- **Relation** → **Account** (Many:1, optional)
- **DropTicket** → **CarrierCommunication** (1:Many)
- **DropTicket** → **Document** (1:Many)
- **DropTicket** → **AuditLog** (1:Many)

### Business Rules and Constraints
1. **1035 Eligibility**: Source and target accounts must be compatible types
2. **Owner Consistency**: Owner information must match across all source accounts
3. **Value Validation**: Transfer values cannot exceed surrender values
4. **SLA Enforcement**: Communications must have defined SLA deadlines
5. **Audit Completeness**: All state changes must generate audit log entries
6. **Document Security**: All documents must be encrypted at rest
7. **User Authentication**: All actions must be attributed to authenticated users
8. **Relation Integrity**: Each DropTicket must have exactly one owner, insured, and agent relation
9. **Account Ownership**: Each Account must have at least one owner relation
10. **Role Uniqueness**: A Party can only have one active user role relation at a time

### Data Retention Policies
- **Active Exchanges**: Retained indefinitely
- **Completed Exchanges**: Retained for 7 years (regulatory requirement)
- **Audit Logs**: Retained for 10 years
- **User Sessions**: Expired sessions purged after 30 days
- **Documents**: Retained per exchange retention policy
- **Communications**: Retained for 7 years
- **Inactive Relations**: Retained for audit purposes but marked as inactive

### Advantages of the New Schema Design

1. **Flexibility**: The Party/Relation model allows for complex relationships and role changes over time
2. **Normalization**: Reduces data duplication by storing person information once
3. **Auditability**: Relation history provides complete audit trail of role changes
4. **Scalability**: Easy to add new role types without schema changes
5. **Security**: Role-based access control is more granular and manageable
6. **Compliance**: Better support for data retention and privacy requirements

This comprehensive data schema supports the complete 1035 exchange workflow while ensuring security, compliance, and auditability throughout the process, with improved flexibility through the normalized Party/Relation design.