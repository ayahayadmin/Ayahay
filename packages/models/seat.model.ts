import { ICabin } from './cabin.model';
import { ISeatType } from './seat-type.model';

export interface ISeat {
  id: number;
  cabinId: number;
  cabin?: ICabin;
  seatTypeId: number;
  /**
   * TODO: refactor Seat Type; have it like Cabin Type wherein it's Company specific
   * also add Trip Seat Type for trip-specific rate for each seat type
   * also add Seat Type for schedule rate
   */
  seatType?: ISeatType;

  name: string;
  rowNumber: number;
  columnNumber: number;
}
