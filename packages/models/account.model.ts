import { IPassenger } from './passenger.model';
import { ACCOUNT_ROLE } from '@ayahay/constants';

export interface IAccount {
  // firebase user ID
  id: string;
  passengerId?: number;
  passenger?: IPassenger;

  email: string;
  role: keyof typeof ACCOUNT_ROLE;
}

export interface LoginForm {
  email: string;
  password: string;
}
