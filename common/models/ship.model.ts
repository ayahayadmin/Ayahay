export default interface Ship {
  id: number;
  name: string;
  passengerCapacity: number;
  vehicleCapacity: number;
}

export const mockShip: Ship = {
  id: 1,
  name: 'Cokaliong',
  passengerCapacity: 150,
  vehicleCapacity: 10,
};
