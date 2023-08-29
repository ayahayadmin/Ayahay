import { IPassenger } from './passenger.model';
import {
  IVehicleType,
  sedanVehicleType,
  suvVehicleType,
} from './vehicle-type.model';

export interface IPassengerVehicle {
  id: number;
  passengerId: number;
  passenger?: IPassenger;
  vehicleTypeId: number;
  vehicleType?: IVehicleType;

  plateNo: string;
  modelName: string;
  modelYear: number;

  officialReceiptUrl: string;
  certificateOfRegistrationUrl: string;
}

export const mockInnova: IPassengerVehicle = {
  id: 1,
  passengerId: 1,
  vehicleTypeId: suvVehicleType.id,
  vehicleType: suvVehicleType,
  plateNo: 'ABC123',
  modelName: 'Toyota Innova',
  modelYear: 2019,
  officialReceiptUrl: '',
  certificateOfRegistrationUrl: '',
};

export const mockPickup: IPassengerVehicle = {
  id: 2,
  passengerId: 1,
  vehicleTypeId: sedanVehicleType.id,
  vehicleType: sedanVehicleType,
  plateNo: 'DEF456',
  modelName: 'Ford F-150',
  modelYear: 2016,
  officialReceiptUrl: '',
  certificateOfRegistrationUrl: '',
};
