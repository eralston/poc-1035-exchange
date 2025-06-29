import { BaseEntity, Gender, RelationType, RelationshipToOwner, UserRole, Address } from './Common';
import { DropTicket } from './DropTicket';
import { Account } from './Account';
import { UserSession } from './UserSession';
import { AuditLog } from './Audit';

export interface Party extends BaseEntity {
  firstName: string;
  lastName: string;
  middleName?: string;
  email?: string;
  phone?: string;
  
  // Optional fields - union of all role requirements
  dateOfBirth?: Date; // Required for insured, optional for others
  ssn?: string; // Encrypted - required for owner/insured
  gender?: Gender; // For insured parties
  
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

  // Navigation properties
  relations?: Relation[];
  userSessions?: UserSession[];
  auditLogs?: AuditLog[];
}

export interface Relation extends BaseEntity {
  partyId: string;
  dropTicketId?: string; // For drop-ticket level relations
  accountId?: string; // For account-specific relations
  relationType: RelationType;
  relationshipToOwner?: RelationshipToOwner; // For insured parties
  userRole?: UserRole; // For user relations
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  metadata?: Record<string, any>; // Role-specific metadata

  // Navigation properties
  party?: Party;
  dropTicket?: DropTicket;
  account?: Account;
}