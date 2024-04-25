import { IPassenger } from './passenger.model';
import { ACCOUNT_ROLE, CIVIL_STATUS, OCCUPATION, SEX } from '@ayahay/constants';
import { IVehicle } from './vehicle.model';
import { IShippingLine } from './shipping-line.model';
import { ITravelAgency } from './travel-agency.model';

export interface IAccount {
  // firebase user ID
  id: string;
  passengerId?: number;
  passenger?: IPassenger;
  shippingLineId?: number;
  shippingLine?: IShippingLine;
  travelAgencyId?: number;
  travelAgency?: ITravelAgency;

  email: string;
  role: keyof typeof ACCOUNT_ROLE;
  apiKey?: string;

  passengers?: IPassenger[];
  vehicles?: IVehicle[];
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirm: string;
  agreement: boolean;
  firstName: string;
  lastName: string;
  occupation: keyof typeof OCCUPATION;
  sex: keyof typeof SEX;
  civilStatus: keyof typeof CIVIL_STATUS;
  birthday: string;
  address: string;
  nationality: string;
}
