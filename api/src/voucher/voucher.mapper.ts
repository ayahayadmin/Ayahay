import { Injectable } from '@nestjs/common';
import { IVoucher } from '@ayahay/models';
import { Prisma } from '@prisma/client';

@Injectable()
export class VoucherMapper {
  constructor() {}

  convertVoucherToDto(voucher: any): IVoucher {
    return {
      code: voucher.code,
      createdByAccountId: voucher.createdByAccountId,

      description: voucher.description,
      discountFlat: voucher.discountFlat,
      discountPercent: voucher.discountPercent,
      numberOfUses: voucher.numberOfUses ?? undefined,
      remainingUses: voucher.remainingUses ?? undefined,
      expiryIso: voucher.expiry.toISOString(),

      minVehicles: voucher.minVehicles ?? undefined,
    };
  }

  convertVoucherToEntityForCreation(
    voucher: IVoucher
  ): Prisma.VoucherCreateArgs {
    return {
      data: {
        code: voucher.code,
        createdByAccountId: voucher.createdByAccountId,

        description: voucher.description,
        discountFlat: voucher.discountFlat,
        discountPercent: voucher.discountPercent,
        numberOfUses: voucher.numberOfUses ?? null,
        remainingUses: voucher.remainingUses ?? null,
        expiry: voucher.expiryIso,

        minVehicles: voucher.minVehicles ?? null,
      },
    };
  }
}
