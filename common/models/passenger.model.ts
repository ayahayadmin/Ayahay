import { CIVIL_STATUS, OCCUPATION, SEX } from '@/common/constants/enum';
import { Profile } from '@/common/models/profile.model';
import PassengerPreferences, {
  mockPreferences,
} from '@/common/models/passenger-preferences';
import dayjs from 'dayjs';

export default interface Passenger {
  id: number;
  profile?: Profile;
  firstName: string;
  lastName: string;
  occupation: keyof typeof OCCUPATION;
  sex: keyof typeof SEX;
  civilStatus: keyof typeof CIVIL_STATUS;
  birthdayIso: string;
  address: string;
  nationality: string;
  preferences?: PassengerPreferences;
  companions?: Passenger[];
}

export const mockPassenger: Passenger = {
  id: 1,
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

export const mockSon: Passenger = {
  id: 3,
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

export const mockWife: Passenger = {
  id: 2,
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

export const mockFather: Passenger = {
  id: 1,
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
};

// antd form doesn't accept ISO date strings as valid dates, so we have to manually set it
export function toFormValue(passenger: Passenger) {
  const { birthdayIso, ...otherPassengerProperties } = passenger;
  return {
    birthdayIso: dayjs(birthdayIso),
    ...otherPassengerProperties,
  };
}
