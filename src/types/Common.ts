// Common types and enums used across the application

export type DropTicketStatus = 'submitted' | 'validated' | 'in_progress' | 'completed' | 'cancelled';
export type Priority = 'low' | 'normal' | 'high' | 'urgent';
export type ProductType = 'life_insurance' | 'annuity';
export type AccountStatus = 'pending' | 'validated' | 'awaiting_carrier' | 'confirmed' | 'transferred';
export type CommunicationType = 'request' | 'response' | 'reminder' | 'escalation';
export type CommunicationMethod = 'email' | 'fax' | 'api' | 'phone' | 'portal';
export type CommunicationDirection = 'outbound' | 'inbound';
export type CommunicationStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'responded' | 'failed';
export type RelationType = 'owner' | 'insured' | 'agent' | 'beneficiary' | 'user' | 'carrier_rep';
export type RelationshipToOwner = 'self' | 'spouse' | 'child' | 'other';
export type UserRole = 'agent' | 'home_office_admin' | 'operations_staff' | 'system_admin';
export type Gender = 'male' | 'female' | 'other';
export type DocumentType = 'application' | 'policy_statement' | 'id_verification' | 'signature_page';
export type SignatureStatus = 'not_required' | 'pending' | 'signed' | 'rejected';
export type AuditAction = 'create' | 'update' | 'delete' | 'approve' | 'override' | 'communicate';
export type EntityType = 'drop_ticket' | 'account' | 'communication' | 'document' | 'party' | 'relation';
export type OverrideType = 'validation_bypass' | 'status_change' | 'sla_extension';

// Base interface for all entities
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Address interface used across multiple entities
export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}