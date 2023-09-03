import { IAccount } from './account.model';
import {
  IVehicleType,
  pickupVehicleType,
  suvVehicleType,
} from './vehicle-type.model';

export interface IVehicle {
  id: number;
  accountId?: string;
  account?: IAccount;
  vehicleTypeId: number;
  vehicleType?: IVehicleType;

  plateNo: string;
  modelName: string;
  modelYear: number;

  officialReceiptUrl: string;
  certificateOfRegistrationUrl: string;
}

export const mockInnova: IVehicle = {
  id: -1,
  vehicleTypeId: suvVehicleType.id,
  vehicleType: suvVehicleType,
  plateNo: 'ABC123',
  modelName: 'Toyota Innova',
  modelYear: 2019,
  officialReceiptUrl: '',
  certificateOfRegistrationUrl: '',
};

export const mockPickup: IVehicle = {
  id: -2,
  vehicleTypeId: pickupVehicleType.id,
  vehicleType: pickupVehicleType,
  plateNo: 'DEF456',
  modelName: 'Ford F-150',
  modelYear: 2016,
  officialReceiptUrl: '',
  certificateOfRegistrationUrl: '',
};
