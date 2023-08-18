export interface IVehicleType {
  id: number;

  name: string;
  description: string;
}

export const sedanVehicleType: IVehicleType = {
  id: -1,
  name: 'Sedan',
  description: 'Sedan',
};

export const suvVehicleType: IVehicleType = {
  id: -1,
  name: 'SUV',
  description: 'SUV',
};

export const mockVehicleTypes: IVehicleType[] = [
  sedanVehicleType,
  suvVehicleType,
  {
    id: -1,
    name: 'Owner Jeep',
    description: 'Owner Jeep',
  },
  {
    id: -1,
    name: 'Pick-up',
    description: 'Pick-up',
  },
  {
    id: -1,
    name: 'Tricycle',
    description: 'Tricycle',
  },
];
