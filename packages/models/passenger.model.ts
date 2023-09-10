import {
  CIVIL_STATUS,
  DISCOUNT_TYPE,
  OCCUPATION,
  SEX,
} from '@ayahay/constants/enum';
import { PassengerPreferences } from '@ayahay/http';
import { IVehicle, mockInnova, mockPickup } from './vehicle.model';
import { IAccount } from './account.model';

export interface IPassenger {
  id: number;
  accountId?: string;
  account?: IAccount;
  buddyId?: number;
  buddy?: IPassenger;

  firstName: string;
  lastName: string;
  occupation: keyof typeof OCCUPATION;
  sex: keyof typeof SEX;
  civilStatus: keyof typeof CIVIL_STATUS;
  birthdayIso: string;
  address: string;
  nationality: string;
  discountType?: keyof typeof DISCOUNT_TYPE;

  companions?: IPassenger[];
}

export const mockPassenger: IPassenger = {
  id: -4,
  firstName: 'John',
  lastName: 'Doe',
  occupation: 'Student',
  sex: 'Male',
  civilStatus: 'Single',
  birthdayIso: '1999/09/09',
  address: 'Quezon City',
  nationality: 'Filipino',
};

export const mockSon: IPassenger = {
  id: -3,
  firstName: 'Son',
  lastName: 'Santos',
  occupation: 'Student',
  sex: 'Male',
  civilStatus: 'Single',
  birthdayIso: '2018-05-05',
  address: 'Mandaluyong City',
  nationality: 'Filipino',
};

export const mockWife: IPassenger = {
  id: -2,
  firstName: 'Wife',
  lastName: 'Santos',
  occupation: 'Unemployed',
  sex: 'Female',
  civilStatus: 'Married',
  birthdayIso: '1999-05-05',
  address: 'Mandaluyong City',
  nationality: 'Filipino',
};

export const mockFather: IPassenger = {
  id: -1,
  firstName: 'Father',
  lastName: 'Santos',
  occupation: 'Employed',
  sex: 'Male',
  civilStatus: 'Married',
  birthdayIso: '1999-10-20',
  address: 'Mandaluyong City',
  nationality: 'Filipino',
  companions: [mockWife, mockSon],
};

export const mockPassengers: IPassenger[] = [
  mockPassenger,
  mockFather,
  mockWife,
  mockSon,
];
