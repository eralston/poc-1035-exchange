import { BaseEntity, CommunicationMethod } from './Common';
import { Account } from './Account';
import { CarrierCommunication } from './Communication';

export interface Carrier extends BaseEntity {
  name: string;
  code: string; // Short identifier
  contactEmail?: string;
  contactPhone?: string;
  preferredCommunicationMethod: CommunicationMethod;
  apiEndpoint?: string;
  apiKey?: string; // Encrypted
  slaHours: number; // Standard response time
  isActive: boolean;

  // Navigation properties
  accounts?: Account[];
  communications?: CarrierCommunication[];
}