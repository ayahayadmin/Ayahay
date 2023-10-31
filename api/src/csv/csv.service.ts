import { Injectable } from '@nestjs/common';
import { Cabin, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { IBooking } from '@ayahay/models';
import { Blob } from 'buffer';

@Injectable()
export class CsvService {
  constructor(private prisma: PrismaService) {}

  generateBookingCsv(bookings: IBooking[] | any[]) {
    //there should be no any type
    //TO DO: this should return Blob instead of string[]
    const headers = [
      'Names',
      'Birth Date',
      'Age',
      'Sex',
      // 'Ticket No.',
      'Nationality',
      'Address',
      'Discount Type',
      'Origin',
      'Destination',
      'Trip Date & Time',
      'Rates',
    ]
      .map((v) => v.replace('"', '""'))
      .map((v) => `"${v}"`)
      .join(',')
      .concat('\r\n');

    const content = [headers];
    content.push(
      bookings
        .filter(
          (booking) =>
            booking.bookingPassengers && booking.bookingPassengers.length > 0
        )
        .map((booking) => {
          return (
            booking.bookingPassengers &&
            booking.bookingPassengers
              .map((bookingPassenger: any, idx) => {
                const name =
                  bookingPassenger.passenger.firstName +
                  ' ' +
                  bookingPassenger.passenger.lastName;
                const birthDate = this.changeDateFormat(
                  bookingPassenger.passenger.birthday
                );
                const age = this.computeAge(
                  bookingPassenger.passenger.birthday
                );
                const departureDate = this.changeDateFormat(
                  bookingPassenger.trip?.departureDate,
                  true
                );

                return [
                  name ?? '',
                  birthDate ?? '',
                  age ?? '',
                  bookingPassenger.passenger?.sex ?? '',
                  // booking?.referenceNo ?? '',
                  bookingPassenger.passenger?.nationality ?? '',
                  bookingPassenger.passenger?.address ?? '',
                  bookingPassenger.passenger?.discountType ?? 'Adult',
                  bookingPassenger.trip?.srcPort.name ?? '',
                  bookingPassenger.trip?.destPort.name ?? '',
                  departureDate ?? '',
                  booking?.paymentItems[idx].price ?? '',
                ]
                  .map(String) // convert every value to String
                  .map((v) => v.replace('"', '""')) // escape double colons
                  .map((v) => `"${v}"`) // quote it
                  .join(','); // comma-separated;
              })
              .join('\r\n')
          );
        })
        .join('\r\n') // rows starting on new lines
    );

    return content;
    // return new Blob([...content], { type: 'text/csv;charset=utf-8;' });
  }

  private computeAge(birthday: string) {
    var today = new Date();
    var birthDate = new Date(birthday);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  private changeDateFormat(date: string, withTime = false) {
    const newDate = new Date(date);
    const month = newDate.getMonth() + 1;
    const newDateFormat =
      newDate.getFullYear() + '-' + month + '-' + newDate.getDate();

    let time;
    if (withTime) {
      time = newDate.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return withTime ? newDateFormat + ' at ' + time : newDateFormat;
  }
}
