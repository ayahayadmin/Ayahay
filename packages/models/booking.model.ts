import {
  IBookingPassenger,
  mockBookingPassengers,
} from './booking-passenger.model';
import { IBookingVehicle } from './booking-vehicle.model';
import { PAYMENT_STATUS, BOOKING_TYPE } from '@ayahay/constants/enum';
import { IPaymentItem } from './payment-item.model';
import { IAccount } from './account.model';

export interface IBooking {
  id: string;
  accountId: string;
  account?: IAccount;

  status: keyof typeof PAYMENT_STATUS;
  totalPrice: number;
  bookingType: keyof typeof BOOKING_TYPE;
  createdAtIso: string;

  bookingPassengers?: IBookingPassenger[];
  bookingVehicles?: IBookingVehicle[];
  paymentItems?: IPaymentItem[];
}

export const mockBooking: IBooking = {
  id: '1',
  accountId: '',
  totalPrice: 1000,
  bookingType: 'Single',
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
    id: '2',
    accountId: '',
    totalPrice: 1000,
    bookingType: 'Single',
    createdAtIso: '',
    status: 'Pending',
  },
  {
    id: '3',
    accountId: '',
    totalPrice: 1000,
    bookingType: 'Single',
    createdAtIso: '',
    status: 'Pending',
  },
  {
    id: '4',
    accountId: '',
    totalPrice: 1000,
    bookingType: 'Single',
    createdAtIso: '',
    status: 'Pending',
    bookingPassengers: [mockBookingPassengers[6]],
  },
  {
    id: '5',
    accountId: '',
    totalPrice: 1000,
    bookingType: 'Single',
    createdAtIso: '',
    status: 'Pending',
    bookingPassengers: [
      mockBookingPassengers[7],
      mockBookingPassengers[8],
      mockBookingPassengers[9],
    ],
  },
  {
    id: '6',
    accountId: '',
    totalPrice: 1000,
    bookingType: 'Single',
    createdAtIso: '',
    status: 'Pending',
  },
];
