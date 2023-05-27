import { ITrip, mockShip } from '@ayahay/models';
import { addTrips } from '@/services/trip.service';

export function processTripCsv(
  file: File,
  onSuccess: (trips: ITrip[]) => void
) {
  const reader = new FileReader();

  reader.addEventListener(
    'load',
    () => {
      if (typeof reader.result === 'string') {
        const addedTrips = processTripRows(csvStringToArray(reader.result));
        onSuccess(addedTrips);
      }
    },
    false
  );

  if (file) {
    reader.readAsText(file);
  }
}

function processTripRows(rows: string[][]): ITrip[] {
  const trips: ITrip[] = [];

  // first row is header row; ignore that
  for (let i = 1; i < rows.length; i++) {
    const trip = processTripRow(rows[i]);
    trips.push(trip);
  }

  addTrips(trips);
  return trips;
}

function processTripRow(row: string[]): ITrip {
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

  console.log(trip);
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
    baseFare: Number.parseFloat(trip.baseFare),
    availableSeatTypes: [],
    availableCabins: [],
    meals: [],
  };
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
