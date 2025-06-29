import { BaseEntity, DropTicketStatus, Priority, ProductType } from './Common';
import { Account } from './Account';
import { Relation } from './Party';
import { CarrierCommunication } from './Communication';
import { Document } from './Document';
import { AuditLog } from './Audit';
import { Override } from './Audit';
import { Carrier } from './Carrier';

export interface DropTicket extends BaseEntity {
  ticketNumber: string; // Human-readable identifier
  status: DropTicketStatus;
  priority: Priority;
  submissionDate: Date;
  targetProductType: ProductType;
  targetCarrierId: string;
  estimatedValue?: number;
  notes?: string;
  createdBy: string; // User ID
  assignedTo?: string; // User ID

  // Navigation properties
  targetCarrier?: Carrier;
  accounts?: Account[]; // Source and target accounts
  relations?: Relation[]; // All parties involved
  communications?: CarrierCommunication[];
  documents?: Document[];
  auditLogs?: AuditLog[];
  overrides?: Override[];
}