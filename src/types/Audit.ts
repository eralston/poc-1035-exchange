import { BaseEntity, AuditAction, EntityType, OverrideType } from './Common';
import { DropTicket } from './DropTicket';
import { Party } from './Party';

export interface AuditLog extends BaseEntity {
  dropTicketId?: string;
  userId?: string; // Party ID
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;

  // Navigation properties
  dropTicket?: DropTicket;
  user?: Party;
}

export interface Override extends BaseEntity {
  dropTicketId: string;
  overrideType: OverrideType;
  originalValue?: string;
  newValue?: string;
  justification: string;
  approvedBy: string; // User ID
  approvalDate: Date;

  // Navigation properties
  dropTicket?: DropTicket;
  approvedByUser?: Party;
}