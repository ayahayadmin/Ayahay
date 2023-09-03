import {
  IBookingPassenger,
  mockBookingPassengers,
} from './booking-passenger.model';
import { IBookingVehicle } from './booking-vehicle.model';
import { PAYMENT_STATUS, BOOKING_TYPE } from '@ayahay/constants/enum';
import { IPaymentItem } from './payment-item.model';
import { IAccount } from './account.model';

export interface IBooking {
  id: number;
  accountId: string;
  account?: IAccount;

  status: keyof typeof PAYMENT_STATUS;
  totalPrice: number;
  bookingType: keyof typeof BOOKING_TYPE;
  paymentReference: string;
  createdAtIso: string;

  bookingPassengers?: IBookingPassenger[];
  bookingVehicles?: IBookingVehicle[];
  paymentItems?: IPaymentItem[];
}

export const mockBooking: IBooking = {
  id: 1,
  accountId: '',
  totalPrice: 1000,
  bookingType: 'Single',
  paymentReference: '28b27d88-4e60-4812-9afe-789611e5e9e6',
  createdAtIso: '',
  status: 'Pending',
  bookingPassengers: [
    mockBookingPassengers[0],
    mockBookingPassengers[1],
    mockBookingPassengers[2],
    mockBookingPassengers[3],
    mockBookingPassengers[4],
    mockBookingPassengers[5],
  ],
};

export const mockBookings: IBooking[] = [
  mockBooking,
  {
    id: 2,
    accountId: '',
    totalPrice: 1000,
    bookingType: 'Single',
    paymentReference: 'a3b11f19-08d2-4d72-addb-4e0e51e736b6',
    createdAtIso: '',
    status: 'Pending',
  },
  {
    id: 3,
    accountId: '',
    totalPrice: 1000,
    bookingType: 'Single',
    paymentReference: '44606c81-c366-428b-8e24-68de9fff3759',
    createdAtIso: '',
    status: 'Pending',
  },
  {
    id: 4,
    accountId: '',
    totalPrice: 1000,
    bookingType: 'Single',
    paymentReference: 'f7c128b9-ad49-45fa-a166-031165d4dbcb',
    createdAtIso: '',
    status: 'Pending',
    bookingPassengers: [mockBookingPassengers[6]],
  },
  {
    id: 5,
    accountId: '',
    totalPrice: 1000,
    bookingType: 'Single',
    paymentReference: 'd1df8010-0be1-4875-b596-5f42b74c2b7d',
    createdAtIso: '',
    status: 'Pending',
    bookingPassengers: [
      mockBookingPassengers[7],
      mockBookingPassengers[8],
      mockBookingPassengers[9],
    ],
  },
  {
    id: 6,
    accountId: '',
    totalPrice: 1000,
    bookingType: 'Single',
    paymentReference: '9d5da2c0-b4c1-47a5-9a7b-ae1ebca961e7',
    createdAtIso: '',
    status: 'Pending',
  },
];
