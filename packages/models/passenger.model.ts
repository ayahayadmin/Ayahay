import { CIVIL_STATUS, OCCUPATION, SEX } from '@ayahay/constants/enum';
import { IProfile } from './profile.model';
import { PassengerPreferences, mockPreferences } from './passenger-preferences';
import dayjs from 'dayjs';
import {
  IPassengerVehicle,
  mockInnova,
  mockPickup,
} from './passenger-vehicle.model';
import { IAccount } from './account.model';

export interface IPassenger {
  id: number;
  accountId?: string;
  account?: IAccount;
  firstName: string;
  lastName: string;
  occupation: keyof typeof OCCUPATION;
  sex: keyof typeof SEX;
  civilStatus: keyof typeof CIVIL_STATUS;
  birthdayIso: string;
  address: string;
  nationality: string;
  preferences?: PassengerPreferences;
  buddyId?: number;
  companions?: IPassenger[];
  vehicles?: IPassengerVehicle[];
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
  preferences: mockPreferences,
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
  preferences: mockPreferences,
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
  preferences: mockPreferences,
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
  preferences: mockPreferences,
  companions: [mockWife, mockSon],
  vehicles: [mockInnova, mockPickup],
};

// antd form doesn't accept ISO date strings as valid dates, so we have to manually set it
export function toFormValue(passenger: IPassenger) {
  const { birthdayIso, ...otherPassengerProperties } = passenger;
  return {
    birthdayIso: dayjs(birthdayIso),
    ...otherPassengerProperties,
  };
}

export const mockPassengers: IPassenger[] = [
  mockPassenger,
  mockFather,
  mockWife,
  mockSon,
];
