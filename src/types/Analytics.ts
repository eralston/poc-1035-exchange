import { BaseEntity } from './Common';
import { DropTicket } from './DropTicket';

export interface ExchangeMetrics extends BaseEntity {
  dropTicketId: string;
  metricDate: Date;
  cycleTimeHours?: number;
  slaBreaches: number;
  carrierResponseTimeHours?: number;
  totalValue?: number;
  accountCount: number;
  overrideCount: number;

  // Navigation properties
  dropTicket?: DropTicket;
}