import { ForbiddenException, Injectable } from '@nestjs/common';
import {
  IAccount,
  IBookingTrip,
  IBookingTripPassenger,
  IBookingTripVehicle,
} from '@ayahay/models';

@Injectable()
export class UtilityService {
  /**
   * generates a reference number according to this format
   * aaaaabbbbbbbbbb
   * wherein a is a 5-character long random string
   * and b is the hexadecimal representation of an ID
   * @param id
   */
  generateReferenceNo(id: number) {
    const randomString = this.generateRandomAlphanumericString(5);
    return `${randomString}${id.toString(16).toUpperCase()}`;
  }

  generateRandomAlphanumericString(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }

  verifyLoggedInAccountHasAccessToShippingLineRestrictedEntity(
    shippingLineRestrictedEntity: { shippingLineId: number },
    loggedInAccount: IAccount
  ) {
    if (loggedInAccount.role === 'SuperAdmin') {
      return;
    }
    if (
      loggedInAccount.shippingLineId !==
      shippingLineRestrictedEntity.shippingLineId
    ) {
      throw new ForbiddenException();
    }
  }

  hasPrivilegedAccess(loggedInAccount?: IAccount): boolean {
    if (loggedInAccount === undefined) {
      return false;
    }

    const privilegedAccessRoles = [
      'ShippingLineStaff',
      'ShippingLineAdmin',
      'SuperAdmin',
    ];
    return privilegedAccessRoles.includes(loggedInAccount.role);
  }

  combineAllBookingTripEntities(bookingTrips: IBookingTrip[]): {
    bookingTripPassengers: IBookingTripPassenger[];
    bookingTripVehicles: IBookingTripVehicle[];
  } {
    const bookingTripPassengers: IBookingTripPassenger[] = [];
    const bookingTripVehicles: IBookingTripVehicle[] = [];

    bookingTrips.forEach((bookingTrip) => {
      bookingTripPassengers.push(...bookingTrip.bookingTripPassengers);
      bookingTripVehicles.push(...bookingTrip.bookingTripVehicles);
    });

    return {
      bookingTripPassengers,
      bookingTripVehicles,
    };
  }
}
