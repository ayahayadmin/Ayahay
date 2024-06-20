import { IRateTable } from './rate-table.model';
import { ITravelAgency } from './travel-agency.model';
import { IClient } from './client.model';

export interface IRateTableMarkup {
  id: number;
  rateTableId: number;
  rateTable?: IRateTable;
  // if not null, this markup is for the specified travel agency
  travelAgencyId?: number;
  travelAgency?: ITravelAgency;
  // if not null, this markup is for the specified client
  clientId?: number;
  client?: IClient;

  markupFlat: number;
  markupPercent: number;
  markupMaxFlat: number;
}
