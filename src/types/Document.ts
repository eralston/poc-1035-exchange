import { BaseEntity, DocumentType, SignatureStatus } from './Common';
import { DropTicket } from './DropTicket';
import { Party } from './Party';

export interface Document extends BaseEntity {
  dropTicketId: string;
  filename: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  documentType: DocumentType;
  storagePath: string;
  checksum: string;
  isEncrypted: boolean;
  uploadedBy: string; // User ID
  signatureStatus?: SignatureStatus;
  signatureDate?: Date;

  // Navigation properties
  dropTicket?: DropTicket;
  uploadedByUser?: Party;
}