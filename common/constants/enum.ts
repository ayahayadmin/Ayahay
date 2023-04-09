export enum ROLE {
  Client = 'Client',
  Admin = 'Admin',
}

export enum SEX {
  Male = 'Male',
  Female = 'Female',
}

export enum CIVIL_STATUS {
  Single = 'Single',
  Married = 'Married',
  Divorced = 'Divorced',
  Widowed = 'Widowed',
}

export enum CABIN_TYPE {
  Economy = 'Economy Class',
  Business = 'Business Class',
  First = 'First Class',
}

export enum SEAT_TYPE {
  Window = 'Window Seat',
  Aisle = 'Aisle Seat',
  SingleBed = 'Single Bed',
  LowerBunkBed = 'Lower Bunk Bed',
  UpperBunkBed = 'Upper Bunk Bed',
}

export enum TRIP_TYPE {
  Single = 'Single Trip',
  Round = 'Round Trip',
  Multiple = 'Multiple Trips',
}

export function getEnumKeyFromValue(enumType: any, enumValue: any): string {
  return Object.keys(enumType).find((key) => enumType[key] === enumValue) || '';
}
