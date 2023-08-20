export interface IVehicleType {
  id: number;

  name: string;
  description: string;
}

export const sedanVehicleType: IVehicleType = {
  id: 6,
  name: 'Sedan',
  description: 'Sedan',
};

export const suvVehicleType: IVehicleType = {
  id: 7,
  name: 'SUV',
  description: 'SUV',
};

export const mockVehicleTypes: IVehicleType[] = [
  sedanVehicleType,
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
  {
    id: 9,
    name: 'Pickup',
    description: 'Pickup',
  },
];
