import { Injectable } from '@nestjs/common';
import { IPaymentItem } from '@ayahay/models';

@Injectable()
export class PaymentMapper {
  convertPaymentItemToDto(paymentItem: any): IPaymentItem {
    return {
      id: paymentItem.id,
      bookingId: paymentItem.bookingId,

      price: paymentItem.price,
      description: paymentItem.description,
    };
  }
}
