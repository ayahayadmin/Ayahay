import { Injectable } from '@nestjs/common';
import { ShippingLine, Prisma } from '@prisma/client';
import { IShippingLine } from '@ayahay/models';

@Injectable()
export class ShippingLineMapper {
  constructor() {}

  convertShippingLineToDto(shippingLine: ShippingLine): IShippingLine {
    return {
      id: shippingLine.id,
      name: shippingLine.name,
    };
  }
}
