import {
  DropTicketStatus,
  Priority,
  ProductType,
  AccountStatus,
  CommunicationType,
  CommunicationMethod,
  CommunicationDirection,
  CommunicationStatus,
  RelationType,
  RelationshipToOwner,
  UserRole,
  Gender,
  DocumentType,
  SignatureStatus,
  AuditAction,
  EntityType,
  OverrideType
} from '../types/Common';

// Drop Ticket Constants
export const DROP_TICKET_STATUSES: DropTicketStatus[] = [
  'submitted',
  'validated',
  'in_progress',
  'completed',
  'cancelled'
];

export const PRIORITIES: Priority[] = [
  'low',
  'normal',
  'high',
  'urgent'
];

export const PRODUCT_TYPES: ProductType[] = [
  'life_insurance',
  'annuity'
];

// Account Constants
export const ACCOUNT_STATUSES: AccountStatus[] = [
  'pending',
  'validated',
  'awaiting_carrier',
  'confirmed',
  'transferred'
];

// Communication Constants
export const COMMUNICATION_TYPES: CommunicationType[] = [
  'request',
  'response',
  'reminder',
  'escalation'
];

export const COMMUNICATION_METHODS: CommunicationMethod[] = [
  'email',
  'fax',
  'api',
  'phone',
  'portal'
];

export const COMMUNICATION_DIRECTIONS: CommunicationDirection[] = [
  'outbound',
  'inbound'
];

export const COMMUNICATION_STATUSES: CommunicationStatus[] = [
  'pending',
  'sent',
  'delivered',
  'read',
  'responded',
  'failed'
];

// Party and Relation Constants
export const RELATION_TYPES: RelationType[] = [
  'owner',
  'insured',
  'agent',
  'beneficiary',
  'user',
  'carrier_rep'
];

export const RELATIONSHIPS_TO_OWNER: RelationshipToOwner[] = [
  'self',
  'spouse',
  'child',
  'other'
];

export const USER_ROLES: UserRole[] = [
  'agent',
  'home_office_admin',
  'operations_staff',
  'system_admin'
];

export const GENDERS: Gender[] = [
  'male',
  'female',
  'other'
];

// Document Constants
export const DOCUMENT_TYPES: DocumentType[] = [
  'application',
  'policy_statement',
  'id_verification',
  'signature_page'
];

export const SIGNATURE_STATUSES: SignatureStatus[] = [
  'not_required',
  'pending',
  'signed',
  'rejected'
];

// Audit Constants
export const AUDIT_ACTIONS: AuditAction[] = [
  'create',
  'update',
  'delete',
  'approve',
  'override',
  'communicate'
];

export const ENTITY_TYPES: EntityType[] = [
  'drop_ticket',
  'account',
  'communication',
  'document',
  'party',
  'relation'
];

export const OVERRIDE_TYPES: OverrideType[] = [
  'validation_bypass',
  'status_change',
  'sla_extension'
];

// Business Rules and Validation Constants
export const VALIDATION_RULES = {
  // SLA timeframes in hours
  DEFAULT_SLA_HOURS: 72,
  URGENT_SLA_HOURS: 24,
  ESCALATION_WARNING_HOURS: 12,
  
  // Value limits
  MIN_EXCHANGE_VALUE: 1000,
  MAX_EXCHANGE_VALUE: 10000000,
  
  // Document size limits
  MAX_DOCUMENT_SIZE_MB: 50,
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  
  // Password requirements
  MIN_PASSWORD_LENGTH: 12,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_LOWERCASE: true,
  PASSWORD_REQUIRE_NUMBERS: true,
  PASSWORD_REQUIRE_SYMBOLS: true,
  
  // Session management
  SESSION_TIMEOUT_MINUTES: 480, // 8 hours
  MFA_TOKEN_EXPIRY_MINUTES: 5,
  
  // Data retention periods (in days)
  ACTIVE_EXCHANGE_RETENTION_DAYS: -1, // Indefinite
  COMPLETED_EXCHANGE_RETENTION_DAYS: 2555, // 7 years
  AUDIT_LOG_RETENTION_DAYS: 3650, // 10 years
  SESSION_LOG_RETENTION_DAYS: 30,
  
  // Communication retry settings
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MINUTES: 30,
  
  // File naming patterns
  TICKET_NUMBER_PREFIX: 'EX',
  TICKET_NUMBER_LENGTH: 10
} as const;

// Status Display Labels
export const STATUS_LABELS: Record<string, string> = {
  // Drop Ticket Statuses
  submitted: 'Submitted',
  validated: 'Validated',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  
  // Account Statuses
  pending: 'Pending',
  awaiting_carrier: 'Awaiting Carrier',
  confirmed: 'Confirmed',
  transferred: 'Transferred',
  
  // Communication Statuses
  sent: 'Sent',
  delivered: 'Delivered',
  read: 'Read',
  responded: 'Responded',
  failed: 'Failed',
  
  // Priority Labels
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  urgent: 'Urgent'
};

// Color mappings for status indicators
export const STATUS_COLORS: Record<string, string> = {
  // Drop Ticket Status Colors
  submitted: 'blue',
  validated: 'green',
  in_progress: 'yellow',
  completed: 'emerald',
  cancelled: 'red',
  
  // Account Status Colors
  pending: 'gray',
  awaiting_carrier: 'orange',
  confirmed: 'green',
  transferred: 'emerald',
  
  // Priority Colors
  low: 'gray',
  normal: 'blue',
  high: 'orange',
  urgent: 'red'
};

// Role-based permissions matrix
export const ROLE_PERMISSIONS = {
  agent: {
    dropTickets: { own: ['create', 'read', 'update'], all: [] },
    accounts: { own: ['read'], all: [] },
    communications: { own: ['read'], all: [] },
    documents: { own: ['create', 'read', 'update'], all: [] },
    parties: { own: ['read'], all: [] },
    relations: { own: ['read'], all: [] },
    auditLogs: { own: [], all: [] },
    overrides: { own: [], all: [] },
    analytics: { own: [], all: [] },
    systemConfig: { own: [], all: [] }
  },
  home_office_admin: {
    dropTickets: { own: ['read'], all: ['create', 'read', 'update', 'delete'] },
    accounts: { own: [], all: ['create', 'read', 'update', 'delete'] },
    communications: { own: [], all: ['create', 'read', 'update', 'delete'] },
    documents: { own: [], all: ['create', 'read', 'update', 'delete'] },
    parties: { own: [], all: ['read'] },
    relations: { own: [], all: ['create', 'read', 'update', 'delete'] },
    auditLogs: { own: [], all: ['read'] },
    overrides: { own: [], all: ['create', 'read', 'update', 'delete'] },
    analytics: { own: [], all: ['read'] },
    systemConfig: { own: [], all: [] }
  },
  operations_staff: {
    dropTickets: { own: [], all: ['read'] },
    accounts: { own: [], all: ['read'] },
    communications: { own: [], all: ['create', 'read', 'update', 'delete'] },
    documents: { own: [], all: ['read'] },
    parties: { own: [], all: ['read'] },
    relations: { own: [], all: ['read'] },
    auditLogs: { own: [], all: ['read'] },
    overrides: { own: [], all: ['read'] },
    analytics: { own: [], all: ['create', 'read', 'update', 'delete'] },
    systemConfig: { own: [], all: [] }
  },
  system_admin: {
    dropTickets: { own: [], all: ['create', 'read', 'update', 'delete'] },
    accounts: { own: [], all: ['create', 'read', 'update', 'delete'] },
    communications: { own: [], all: ['create', 'read', 'update', 'delete'] },
    documents: { own: [], all: ['create', 'read', 'update', 'delete'] },
    parties: { own: [], all: ['create', 'read', 'update', 'delete'] },
    relations: { own: [], all: ['create', 'read', 'update', 'delete'] },
    auditLogs: { own: [], all: ['create', 'read', 'update', 'delete'] },
    overrides: { own: [], all: ['create', 'read', 'update', 'delete'] },
    analytics: { own: [], all: ['create', 'read', 'update', 'delete'] },
    systemConfig: { own: [], all: ['create', 'read', 'update', 'delete'] }
  }
} as const;

// 1035 Exchange Business Rules
export const EXCHANGE_RULES = {
  // Eligible product type combinations for 1035 exchanges
  ELIGIBLE_EXCHANGES: {
    life_insurance: ['life_insurance', 'annuity'],
    annuity: ['annuity'] // Annuities can only exchange to other annuities
  },
  
  // Required documents by exchange type
  REQUIRED_DOCUMENTS: {
    life_insurance: ['application', 'policy_statement', 'id_verification'],
    annuity: ['application', 'policy_statement', 'id_verification', 'signature_page']
  },
  
  // Validation requirements
  VALIDATION_REQUIREMENTS: {
    OWNER_MATCH_REQUIRED: true,
    INSURED_MATCH_REQUIRED: false, // Can change insured in some cases
    MIN_POLICY_AGE_DAYS: 0, // No minimum age requirement
    OUTSTANDING_LOAN_THRESHOLD: 0.9 // Cannot exceed 90% of surrender value
  }
} as const;