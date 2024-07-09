import { Injectable } from '@nestjs/common';
import { IDisbursement } from '@ayahay/models';
import { OPERATION_COSTS } from '@ayahay/constants';
import { DisbursementsPerTeller } from '@ayahay/http';

@Injectable()
export class DisbursementMapper {
  constructor() {}

  convertDisbursementToDto(disbursement: any): IDisbursement {
    return {
      ...disbursement,
      date: disbursement.date.toISOString(),
      description: disbursement.description as OPERATION_COSTS,
    };
  }

  convertDisbursementToDisbursementsPerTeller(
    disbursement: any
  ): DisbursementsPerTeller {
    return {
      amount: disbursement.amount,
      date: disbursement.date.toISOString(),
      description: disbursement.description as OPERATION_COSTS,
      officialReceipt: disbursement.officialReceipt,
      paidTo: disbursement.paidTo,
      purpose: disbursement.purpose,
      tripId: disbursement.trip.id,
      srcPortCode: disbursement.trip.srcPort.code,
      destPortCode: disbursement.trip.destPort.code,
      departureDateIso: disbursement.trip.departureDate.toISOString(),
    };
  }
}
