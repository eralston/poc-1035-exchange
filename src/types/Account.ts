import { BaseEntity, ProductType, AccountStatus } from './Common';
import { DropTicket } from './DropTicket';
import { Carrier } from './Carrier';
import { Relation } from './Party';
import { CarrierCommunication } from './Communication';

export interface Account extends BaseEntity {
  dropTicketId: string;
  accountNumber: string; // Policy number or account number
  carrierId: string;
  accountType: ProductType;
  productName?: string;
  issueDate?: Date;
  currentValue?: number;
  surrenderValue?: number;
  outstandingLoans?: number;
  status: AccountStatus;
  isSourceAccount: boolean; // true for source, false for target
  validationNotes?: string;

  // Navigation properties
  dropTicket?: DropTicket;
  carrier?: Carrier;
  relations?: Relation[]; // All parties related to this account
  communications?: CarrierCommunication[];
}