import { IPassenger } from './passenger.model';
import { ACCOUNT_ROLE } from '@ayahay/constants';
import { IVehicle } from './vehicle.model';

export interface IAccount {
  // firebase user ID
  id: string;
  passengerId?: number;
  passenger?: IPassenger;

  email: string;
  role: keyof typeof ACCOUNT_ROLE;

  passengers?: IPassenger[];
  vehicles?: IVehicle[];
}

export interface LoginForm {
  email: string;
  password: string;
}
