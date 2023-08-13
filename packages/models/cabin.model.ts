import { ISeat } from './seat.model';
import { IShip } from './ship.model';
import { AZNAR_AIRCON_CABIN, ICabinType } from './cabin-type.model';

export interface ICabin {
  id: number;
  shipId: number;
  ship?: IShip;
  cabinTypeId: number;
  cabinType: ICabinType;
  name: string;
  recommendedPassengerCapacity: number;
  numOfRows: number;
  numOfCols: number;
  seats: ISeat[];
}

export const mockCabinEconomy: ICabin = {
  id: 1,
  shipId: 1,
  cabinTypeId: AZNAR_AIRCON_CABIN.id,
  cabinType: AZNAR_AIRCON_CABIN,
  name: 'first floor',
  recommendedPassengerCapacity: 30,
  numOfRows: 5,
  numOfCols: 6,
  seats: [],
};

export const mockCabinEconomy2: ICabin = {
  id: 2,
  shipId: 1,
  cabinTypeId: AZNAR_AIRCON_CABIN.id,
  cabinType: AZNAR_AIRCON_CABIN,
  name: 'second floor',
  recommendedPassengerCapacity: 30,
  numOfRows: 5,
  numOfCols: 6,
  seats: [],
};

export const mockCabinBusiness: ICabin = {
  id: 3,
  shipId: 1,
  cabinTypeId: AZNAR_AIRCON_CABIN.id,
  cabinType: AZNAR_AIRCON_CABIN,
  name: 'first floor',
  recommendedPassengerCapacity: 30,
  numOfRows: 5,
  numOfCols: 6,
  seats: [],
};

export const mockCabinFirst: ICabin = {
  id: 4,
  shipId: 1,
  cabinTypeId: AZNAR_AIRCON_CABIN.id,
  cabinType: AZNAR_AIRCON_CABIN,
  name: 'first floor',
  recommendedPassengerCapacity: 30,
  numOfRows: 5,
  numOfCols: 6,
  seats: [],
};

export const mockCabins: ICabin[] = [
  mockCabinBusiness,
  mockCabinEconomy,
  mockCabinFirst,
];
