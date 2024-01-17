import { OPERATION_COSTS } from '@ayahay/constants';

export interface IDisbursement {
  date: string;
  officialReceipt: string;
  paidTo: string;
  description: OPERATION_COSTS;
  purpose: string;
  amount: number;
}
