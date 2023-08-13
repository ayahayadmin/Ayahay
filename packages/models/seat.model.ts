import { ICabin } from './cabin.model';
import { ISeatType } from './seat-type.model';

export interface ISeat {
  id: number;
  cabinId: number;
  cabin?: ICabin;
  seatTypeId: number;
  seatType: ISeatType;

  name: string;
  rowNumber: number;
  columnNumber: number;
}
