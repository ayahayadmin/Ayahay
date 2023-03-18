import { CIVIL_STATUS, ROLE, SEX } from '../constants/enum';

export interface BasicProfile {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: ROLE;
}

export interface Profile extends BasicProfile {
  sex: SEX;
  civilStatus: CIVIL_STATUS;
  dateOfBirth: string;
  mobileNumber: string;
  address: string;
  nationality: string;
}
