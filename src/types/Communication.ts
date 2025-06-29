import { BaseEntity, CommunicationType, CommunicationMethod, CommunicationDirection, CommunicationStatus } from './Common';
import { DropTicket } from './DropTicket';
import { Account } from './Account';
import { Carrier } from './Carrier';
import { Party } from './Party';

export interface CarrierCommunication extends BaseEntity {
  dropTicketId: string;
  accountId?: string;
  carrierId: string;
  communicationType: CommunicationType;
  method: CommunicationMethod;
  direction: CommunicationDirection;
  subject?: string;
  content: string;
  status: CommunicationStatus;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  respondedAt?: Date;
  slaDeadline?: Date;
  retryCount: number;
  createdBy?: string; // User ID

  // Navigation properties
  dropTicket?: DropTicket;
  account?: Account;
  carrier?: Carrier;
  createdByUser?: Party;
}