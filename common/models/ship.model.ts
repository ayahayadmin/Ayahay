import Seat, { mockSeats } from './seat.model';
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
