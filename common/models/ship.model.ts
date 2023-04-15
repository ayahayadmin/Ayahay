import Cabin, { mockCabins } from '@/common/models/cabin.model';

export default interface Ship {
  id: number;
  name: string;
  passengerCapacity: number;
  vehicleCapacity: number;
  cabins: Cabin[];
}

export const mockShip: Ship = {
  id: 1,
  name: 'Cokaliong',
  passengerCapacity: 150,
  vehicleCapacity: 10,
  cabins: mockCabins,
};

export const mockShips: Ship[] = [
  mockShip,
  {
    id: 2,
    name: 'Gothong',
    passengerCapacity: 150,
    vehicleCapacity: 10,
    cabins: mockCabins,
  },
];

mockCabins.forEach((cabin) => (cabin.ship = mockShip));
