import { Injectable } from '@nestjs/common';
import { IPassenger, IVehicle, ITrip, IAccount } from '@ayahay/models';
import { PassengerPreferences } from '@ayahay/http';

@Injectable()
export class BookingValidator {
  private readonly MAX_PASSENGERS_PER_BOOKING = 50;
  private readonly MAX_TRIPS_PER_BOOKING = 10;
  private readonly MAX_VEHICLES_PER_BOOKING = 5;

  public validateCreateTentativeBookingRequest(
    trips: ITrip[],
    passengers: IPassenger[],
    passengerPreferences: PassengerPreferences[],
    vehicles: IVehicle[],
    loggedInAccount?: IAccount
  ): string[] {
    const errorMessages: string[] = [];

    if (trips.length === 0) {
      errorMessages.push('A booking must have at least one trip.');
    }

    if (passengers.length === 0 && vehicles.length === 0) {
      errorMessages.push(
        'A booking must have at least one passenger or vehicle.'
      );
    }

    if (trips.length > this.MAX_TRIPS_PER_BOOKING) {
      errorMessages.push(
        `Number of trips for one booking exceeded the maximum of ${this.MAX_TRIPS_PER_BOOKING}`
      );
    }

    // TODO: check if all trip are existing records
    if (passengers.length > this.MAX_PASSENGERS_PER_BOOKING) {
      errorMessages.push(
        `Number of passengers for one booking exceeded the maximum of ${this.MAX_PASSENGERS_PER_BOOKING}`
      );
    }

    if (vehicles.length > this.MAX_VEHICLES_PER_BOOKING) {
      errorMessages.push(
        `Number of vehicles for one booking exceeded the maximum of ${this.MAX_VEHICLES_PER_BOOKING}`
      );
    }

    if (passengers.length !== passengerPreferences.length) {
      errorMessages.push(
        'The number of passengers should match the number of passenger preferences'
      );
    }

    errorMessages.push(
      ...this.validatePassengers(passengers, loggedInAccount),
      ...this.validateTripCapacities(trips, passengers, vehicles)
    );

    // TODO: check if vehicle types are supported by all trips
    // TODO: check if any required field from passenger/vehicle is missing

    return errorMessages;
  }

  private validatePassengers(
    passengers: IPassenger[],
    loggedInAccount?: IAccount
  ): string[] {
    if (passengers.length <= 0) {
      return [];
    }

    const errorMessages: string[] = [];

    for (const passenger of passengers) {
      if (loggedInAccount === undefined && this.isPassengerCreated(passenger)) {
        errorMessages.push(
          'A guest booking cannot have an existing passenger.'
        );
      }

      if (
        loggedInAccount?.role === 'Passenger' &&
        passenger.discountType !== undefined
      ) {
        errorMessages.push(
          'Only staff members can set the discount type of a passenger.'
        );
      }
    }

    return errorMessages;
  }

  private validateBuddy(
    buddy: IPassenger,
    loggedInPassenger: IPassenger
  ): string[] {
    // TODO: fetch passengers with ID from DB, validate they're buddies with logged in passenger

    const errorMessages: string[] = [];
    if (buddy.account !== undefined) {
      errorMessages.push('Travel Buddies cannot be linked to an account.');
    }

    if (
      this.isPassengerCreated(loggedInPassenger) &&
      !this.isBuddyOf(buddy, loggedInPassenger)
    ) {
      errorMessages.push(
        'Travel Buddies should be a buddy of the logged in passenger.'
      );
    }

    return errorMessages;
  }
  private isPassengerCreated(passenger: IPassenger): boolean {
    return passenger.id > 0;
  }

  private isPassengerLinkedToAccount(
    passenger: IPassenger,
    accountId?: string
  ): boolean {
    return passenger.account?.id === accountId;
  }

  private hasBuddy(passenger: IPassenger): boolean {
    return passenger.buddyId !== undefined;
  }

  private isBuddyOf(buddy: IPassenger, passenger: IPassenger): boolean {
    return buddy.buddyId === passenger.id;
  }

  private validateTripCapacities(
    trips: ITrip[],
    passengers: IPassenger[],
    vehicles: IVehicle[]
  ): string[] {
    const errorMessages = [];

    for (const trip of trips) {
      if (vehicles.length > trip.availableVehicleCapacity) {
        errorMessages.push(
          'The number of vehicles for this booking exceeds the available vehicle capacity of this trip.'
        );
      }

      const totalAvailablePassengerCapacity = trip.availableCabins
        .map((tripCabin) => tripCabin.availablePassengerCapacity)
        .reduce(
          (cabinACapacity, cabinBCapacity) => cabinACapacity + cabinBCapacity,
          0
        );

      if (passengers.length > totalAvailablePassengerCapacity) {
        errorMessages.push(
          'The number of passengers for this booking exceeds the available passenger capacity of this trip.'
        );
      }
    }

    return errorMessages;
  }
}
