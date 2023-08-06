import { BadRequestException, Injectable } from '@nestjs/common';
import {
  IPassenger,
  IPassengerVehicle,
  PassengerPreferences,
} from '@ayahay/models';

@Injectable()
export class BookingValidator {
  private readonly MAX_PASSENGERS_PER_BOOKING = 10;
  private readonly MAX_TRIPS_PER_BOOKING = 10;
  private readonly MAX_VEHICLES_PER_BOOKING = 5;

  public validateCreateTentativeBookingRequest(
    loggedInAccountId: string,
    tripIds: number[],
    passengers: IPassenger[],
    passengerPreferences: PassengerPreferences[],
    vehicles: IPassengerVehicle[]
  ): string[] {
    const errorMessages: string[] = [];
    if (tripIds.length > this.MAX_TRIPS_PER_BOOKING) {
      errorMessages.push(
        `Number of trips for one booking exceeded the maximum of ${this.MAX_TRIPS_PER_BOOKING}`
      );
    }
    if (passengers.length <= 0) {
      errorMessages.push(`There must be at least one passenger in the booking`);
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
      ...this.validateBookingPassengers(loggedInAccountId, passengers)
    );

    return errorMessages;
  }

  private validateBookingPassengers(
    loggedInAccountId: string,
    passengers: IPassenger[]
  ): string[] {
    const errorMessages: string[] = [];

    const passengerOfLoggedInUser = passengers[0];

    // we allow passenger without linked account (we link logged in account later)
    if (
      this.isPassengerCreated(passengerOfLoggedInUser) &&
      !this.isPassengerLinkedToAccount(
        passengerOfLoggedInUser,
        loggedInAccountId
      )
    ) {
      errorMessages.push(
        'The account associated with the first passenger is not your account.'
      );
    }

    if (this.hasBuddy(passengerOfLoggedInUser)) {
      errorMessages.push(
        "A passenger with an account cannot be another passenger's buddy"
      );
    }

    for (let i = 1; i < passengers.length; i++) {
      const travelBuddiesOfLoggedInPassenger = passengers[i];
      if (travelBuddiesOfLoggedInPassenger.accountId !== undefined) {
        errorMessages.push('Travel Buddies cannot be linked to an account.');
      }

      if (
        this.isPassengerCreated(passengerOfLoggedInUser) &&
        !this.isBuddyOf(
          travelBuddiesOfLoggedInPassenger,
          passengerOfLoggedInUser
        )
      ) {
        errorMessages.push(
          'Travel Buddies should be a buddy of the logged in passenger.'
        );
      }
    }

    return errorMessages;
  }

  private isPassengerCreated(passenger: IPassenger): boolean {
    return passenger.id > 0;
  }

  private isPassengerLinkedToAccount(
    passenger: IPassenger,
    accountId: string
  ): boolean {
    return passenger.accountId === accountId;
  }

  private hasBuddy(passenger: IPassenger): boolean {
    return passenger.buddyId !== undefined;
  }

  private isBuddyOf(buddy: IPassenger, passenger: IPassenger): boolean {
    return buddy.buddyId === passenger.id;
  }
}
