import { IPassenger } from './passenger.model';

export interface IAccount {
  // firebase user ID
  accountId: string;
  email: string;
  passengerId?: number;
  passenger?: IPassenger;
}
