import { Injectable } from '@nestjs/common';
import { Disbursement } from '@prisma/client';
import { IDisbursement, IPort } from '@ayahay/models';
import { OPERATION_COSTS } from '@ayahay/constants';

@Injectable()
export class DisbursementMapper {
  constructor() {}

  convertDisbursementToDto(disbursement: Disbursement): IDisbursement {
    return {
      ...disbursement,
      date: disbursement.date.toISOString(),
      description: disbursement.description as OPERATION_COSTS,
    };
  }
}
