import { VEHICLE_BODY } from '@ayahay/constants/enum';
import { IPassenger } from './passenger.model';

export interface IPassengerVehicle {
  id: number;
  passengerId: number;
  passenger?: IPassenger;
  plateNo: string;
  modelName: string;
  modelYear: number;

  modelBody: keyof typeof VEHICLE_BODY;
  officialReceiptUrl: string;
  certificateOfRegistrationUrl: string;
}

export const mockInnova: IPassengerVehicle = {
  id: 1,
  passengerId: 1,
  plateNo: 'ABC123',
  modelName: 'Toyota Innova',
  modelYear: 2019,
  modelBody: 'SUV',
  officialReceiptUrl: '',
  certificateOfRegistrationUrl: '',
};

export const mockPickup: IPassengerVehicle = {
  id: 2,
  passengerId: 1,
  plateNo: 'DEF456',
  modelName: 'Ford F-150',
  modelYear: 2016,
  modelBody: 'Pickup',
  officialReceiptUrl: '',
  certificateOfRegistrationUrl: '',
};
