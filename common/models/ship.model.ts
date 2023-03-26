export default interface Ship {
  id: number;
  name: string;
  passengerCapacity: number;
  vehicleCapacity: number;
}

export const mockShip: Ship = {
  id: 1,
  name: 'Cokaliong',
  passengerCapacity: 50,
  vehicleCapacity: 10,
};
