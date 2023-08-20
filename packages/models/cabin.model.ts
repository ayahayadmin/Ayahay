import { IShip } from './ship.model';
import { AZNAR_AIRCON_CABIN, ICabinType } from './cabin-type.model';
import { ISeatPlan } from './seat-plan.model';

export interface ICabin {
  id: number;
  shipId: number;
  ship?: IShip;
  cabinTypeId: number;
  cabinType?: ICabinType;
  defaultSeatPlanId?: number;
  defaultSeatPlan?: ISeatPlan;

  name: string;
  recommendedPassengerCapacity: number;
}

export const mockCabinEconomy: ICabin = {
  id: 1,
  shipId: 1,
  cabinTypeId: AZNAR_AIRCON_CABIN.id,
  cabinType: AZNAR_AIRCON_CABIN,
  name: 'first floor',
  recommendedPassengerCapacity: 30,
};

export const mockCabinEconomy2: ICabin = {
  id: 2,
  shipId: 1,
  cabinTypeId: AZNAR_AIRCON_CABIN.id,
  cabinType: AZNAR_AIRCON_CABIN,
  name: 'second floor',
  recommendedPassengerCapacity: 30,
};

export const mockCabinBusiness: ICabin = {
  id: 3,
  shipId: 1,
  cabinTypeId: AZNAR_AIRCON_CABIN.id,
  cabinType: AZNAR_AIRCON_CABIN,
  name: 'first floor',
  recommendedPassengerCapacity: 30,
};

export const mockCabinFirst: ICabin = {
  id: 4,
  shipId: 1,
  cabinTypeId: AZNAR_AIRCON_CABIN.id,
  cabinType: AZNAR_AIRCON_CABIN,
  name: 'first floor',
  recommendedPassengerCapacity: 30,
};

export const mockCabins: ICabin[] = [
  mockCabinBusiness,
  mockCabinEconomy,
  mockCabinFirst,
];
