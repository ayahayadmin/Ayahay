import { IBooking, ITrip, mockShip, mockShippingLine } from '@ayahay/models';
// import { generateReferenceNo } from '@ayahay/services/random.service';
import { addTrips, getTripByReferenceNo } from '@/services/trip.service';

export function processTripCsv(
  file: File,
  onSuccess: (trips: ITrip[]) => void
) {
  processCsvFile(file, processTripRow, onSuccess);
}

export function processCsvFile<T>(
  file: File,
  processRowFn: (row: string[]) => T,
  onSuccess: (values: T[]) => void
) {
  const reader = new FileReader();

  reader.addEventListener(
    'load',
    () => {
      if (typeof reader.result === 'string') {
        const rows = csvStringToArray(reader.result);
        const values = processCsvRows(rows, processRowFn);
        onSuccess(values);
      }
    },
    false
  );

  if (file) {
    reader.readAsText(file);
  }
}

function csvStringToArray(strData: string): string[][] {
  const objPattern = new RegExp(
    '(\\,|\\r?\\n|\\r|^)(?:"([^"]*(?:""[^"]*)*)"|([^\\,\\r\\n]*))',
    'gi'
  );
  let matches: RegExpMatchArray | null = null;
  let result: string[][] = [[]];
  while ((matches = objPattern.exec(strData))) {
    if (matches[1].length && matches[1] !== ',') result.push([]);
    result[result.length - 1].push(
      matches[2] ? matches[2].replace(new RegExp('""', 'g'), '"') : matches[3]
    );
  }
  return result;
}

function processCsvRows<T>(
  rows: string[][],
  processRowFn: (row: string[]) => T
): T[] {
  const values: T[] = [];

  // first row is header row; ignore that
  for (let i = 1; i < rows.length; i++) {
    values.push(processRowFn(rows[i]));
  }

  return values;
}

function processTripRow(row: string[]): any {
  //should return ITrip
  const headers = [
    'shippingLineName',
    'srcPortName',
    'destPortName',
    'departureDate',
    'baseFare',
  ];

  let trip: any = {};
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i];
    trip[header] = row[i];
  }

  const randomId = Math.floor(Math.random() * 1000);
  return {
    id: randomId,
    shipId: randomId,
    ship: mockShip,
    shippingLineId: randomId,
    shippingLine: {
      id: randomId,
      name: trip.shippingLineName,
    },
    srcPortId: randomId,
    srcPort: {
      id: randomId,
      name: trip.srcPortName,
    },
    destPortId: randomId,
    destPort: {
      id: randomId,
      name: trip.destPortName,
    },
    departureDateIso: new Date(trip.departureDate).toISOString(),
    // baseFare: Number.parseFloat(trip.baseFare),
    availableSeatTypes: [],
    availableCabins: [],
    meals: [],
    referenceNo: 'ABC', // generateReferenceNo(randomId),
  };
}

export function processBookingCsv(
  file: File,
  onSuccess: (bookings: IBooking[]) => void
) {
  processCsvFile(file, processBookingRow, onSuccess);
}

function processBookingRow(rowValues: string[]): IBooking {
  const headers = [
    'tripReferenceNo',
    'srcPortName',
    'destPortName',
    'departureDate',
    'totalPrice',
    'paymentReference',
    'firstName',
    'lastName',
    'occupation',
    'sex',
    'civilStatus',
    'birthdayIso',
    'address',
    'nationality',
  ];

  let rowObject: any = {};
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i];
    rowObject[header] = rowValues[i];
  }

  const randomId = Math.floor(Math.random() * 1000);

  const tripReferenceNo = rowObject.tripReferenceNo;
  let trip: any = getTripByReferenceNo(tripReferenceNo); //trip should be ITrip not any
  if (trip === undefined) {
    trip = {
      id: randomId,
      shipId: randomId,
      ship: mockShip,
      shippingLineId: randomId,
      shippingLine: mockShippingLine,
      srcPortId: randomId,
      srcPort: {
        id: randomId,
        name: rowObject.srcPortName,
      },
      destPortId: randomId,
      destPort: {
        id: randomId,
        name: rowObject.destPortName,
      },
      departureDateIso: new Date(rowObject.departureDate).toISOString(),
      // baseFare: 100,
      availableSeatTypes: [],
      availableCabins: [],
      meals: [],
      referenceNo: tripReferenceNo,
    };

    addTrips([trip]);
  }

  const booking: any = {
    // booking should be IBooking
    id: String(randomId),
    tripId: trip.id,
    trip,
    totalPrice: rowObject.totalPrice,
    referenceNo: 'ABC', //generateReferenceNo(randomId),
    paymentReference: rowObject.paymentReference,
    bookingPassengers: [
      {
        id: randomId,
        bookingId: randomId,
        passengerId: randomId,
        passenger: {
          id: randomId,
          firstName: rowObject.firstName,
          lastName: rowObject.lastName,
          occupation: rowObject.occupation,
          sex: rowObject.sex,
          civilStatus: rowObject.civilStatus,
          birthdayIso: new Date(rowObject.birthdayIso).toISOString(),
          address: rowObject.address,
          nationality: rowObject.nationality,
        },
        seatId: randomId,
        // seat,
        meal: 'Bacsilog',
        totalPrice: rowObject.totalPrice,
        // referenceNo: generateReferenceNo(randomId),
      },
    ],
  };

  // createBooking(booking);

  return booking;
}

export function generateBookingCsv(bookings: IBooking[] | any[]): Blob {
  //there should be no any type
  const content = bookings
    .filter(
      (booking) =>
        booking.bookingPassengers && booking.bookingPassengers.length > 0
    )
    .map((booking) => {
      return (
        booking.bookingPassengers &&
        booking.bookingPassengers
          .map((bookingPassenger: any) => {
            return [
              booking?.trip?.referenceNo ?? '',
              booking?.trip?.srcPort?.name ?? '',
              booking?.trip?.destPort?.name ?? '',
              booking?.trip?.departureDateIso ?? '',
              booking?.totalPrice,
              bookingPassenger.referenceNo ?? '',
              bookingPassenger.passenger?.firstName ?? '',
              bookingPassenger.passenger?.lastName ?? '',
              bookingPassenger.passenger?.occupation ?? '',
              bookingPassenger.passenger?.sex ?? '',
              bookingPassenger.passenger?.civilStatus ?? '',
              bookingPassenger.passenger?.birthdayIso ?? '',
              bookingPassenger.passenger?.address ?? '',
              bookingPassenger.passenger?.nationality ?? '',
            ]
              .map(String) // convert every value to String
              .map((v) => v.replaceAll('"', '""')) // escape double colons
              .map((v) => `"${v}"`) // quote it
              .join(','); // comma-separated;
          })
          .join('\r\n')
      );
    })
    .join('\r\n'); // rows starting on new lines

  return new Blob([content], { type: 'text/csv;charset=utf-8;' });
}
