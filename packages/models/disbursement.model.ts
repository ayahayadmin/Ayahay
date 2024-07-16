import { OPERATION_COSTS } from '@ayahay/constants';
import { IAccount } from './account.model';

export interface IDisbursement {
  createdByAccountId?: string;
  createdByAccount?: IAccount;
  date: string;
  officialReceipt: string;
  paidTo: string;
  description: OPERATION_COSTS;
  purpose: string;
  amount: number;
}
