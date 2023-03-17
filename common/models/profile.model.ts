import { CIVIL_STATUS, SEX } from '../constants/enum';

export interface BasicProfile {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface Profile extends BasicProfile {
  sex: SEX;
  civilStatus: CIVIL_STATUS;
  dateOfBirth: string;
  mobileNumber: string;
  address: string;
  nationality: string;
}
