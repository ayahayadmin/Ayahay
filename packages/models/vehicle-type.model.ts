export interface IVehicleType {
  id: number;

  name: string;
  description: string;
}

export const pickupVehicleType: IVehicleType = {
  id: 9,
  name: 'Pickup',
  description: 'Pickup',
};

export const suvVehicleType: IVehicleType = {
  id: 7,
  name: 'SUV',
  description: 'SUV',
};

export const mockVehicleTypes: IVehicleType[] = [
  pickupVehicleType,
  suvVehicleType,
  {
    id: 1,
    name: 'Bicycle',
    description: 'Bicycle',
  },
  {
    id: 2,
    name: 'Motorcycle',
    description: 'Motorcycle',
  },
  {
    id: 3,
    name: 'Tricycle',
    description: 'Tricycle',
  },
  {
    id: 8,
    name: 'Multicab',
    description: 'Multicab',
  },
];
