import { BaseEntity } from './Common';
import { Party } from './Party';

export interface UserSession extends BaseEntity {
  userId: string; // Party ID where relationType = 'user'
  sessionToken: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: Date;

  // Navigation properties
  user?: Party;
}