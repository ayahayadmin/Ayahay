import { CIVIL_STATUS, ROLE, SEX } from '@ayahay/constants/enum';

export interface BasicProfile {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: keyof typeof ROLE;
}

export interface IProfile extends BasicProfile {
  sex: keyof typeof SEX;
  civilStatus: keyof typeof CIVIL_STATUS;
  dateOfBirth: string;
  mobileNumber: string;
  address: string;
  nationality: string;
}

export interface LoginForm {
  email: string;
  password: string;
}
