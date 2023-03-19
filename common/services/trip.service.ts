import Trip, {
  mockTrip,
  TripData,
  TripPaxes,
} from '@/common/models/trip.model';
import dayjs from 'dayjs';
import {
  ceil,
  find,
  forEach,
  orderBy,
  random,
  split,
  sum,
  values,
} from 'lodash';
import { getShippingLines } from '@/common/services/shipping-line.service';

export function getTrip(tripId: number): Trip {
  return mockTrip;
}

export function getTrips(
  srcPortName: string,
  destPortName: string,
  departureDate: string,
  paxes: TripPaxes,
  sort: string,
  shippingLineIds: number[] | undefined
) {
  const today = dayjs();
  const todayPlus5days = today.add(5, 'day').toISOString();
  const shippingLines = getShippingLines();

  const trips = [
    {
      shippingLine: {
        id: 4,
        name: 'COKALIONG SHIPPING LINES INC.',
      },
      srcPort: {
        id: 10,
        name: 'Cebu',
      },
      destPort: {
        id: 0,
        name: 'Bacolod',
      },
      departureDateIso: today.toISOString(),
      baseFare: getBaseFare(),
      slots: random(0, 10),
    },
    {
      shippingLine: {
        id: 4,
        name: 'COKALIONG SHIPPING LINES INC.',
      },
      srcPort: {
        id: 10,
        name: 'Cebu',
      },
      destPort: {
        id: 0,
        name: 'Bacolod',
      },
      departureDateIso: today.toISOString(),
      baseFare: getBaseFare(),
      slots: random(0, 10),
    },
    {
      shippingLine: {
        id: 4,
        name: 'COKALIONG SHIPPING LINES INC.',
      },
      srcPort: {
        id: 10,
        name: 'Cebu',
      },
      destPort: {
        id: 0,
        name: 'Bacolod',
      },
      departureDateIso: today.toISOString(),
      baseFare: getBaseFare(),
      slots: random(0, 10),
    },
    {
      shippingLine: {
        id: 4,
        name: 'COKALIONG SHIPPING LINES INC.',
      },
      srcPort: {
        id: 10,
        name: 'Cebu',
      },
      destPort: {
        id: 0,
        name: 'Bacolod',
      },
      departureDateIso: today.toISOString(),
      baseFare: getBaseFare(),
      slots: random(0, 10),
    },
    {
      shippingLine: {
        id: 4,
        name: 'COKALIONG SHIPPING LINES INC.',
      },
      srcPort: {
        id: 10,
        name: 'Cebu',
      },
      destPort: {
        id: 0,
        name: 'Bacolod',
      },
      departureDateIso: today.toISOString(),
      baseFare: getBaseFare(),
      slots: random(0, 10),
    },
    {
      shippingLine: {
        id: 4,
        name: 'COKALIONG SHIPPING LINES INC.',
      },
      srcPort: {
        id: 10,
        name: 'Cebu',
      },
      destPort: {
        id: 0,
        name: 'Bacolod',
      },
      departureDateIso: today.toISOString(),
      baseFare: getBaseFare(),
      slots: random(0, 10),
    },
    {
      shippingLine: {
        id: 4,
        name: 'COKALIONG SHIPPING LINES INC.',
      },
      srcPort: {
        id: 10,
        name: 'Cebu',
      },
      destPort: {
        id: 0,
        name: 'Bacolod',
      },
      departureDateIso: today.toISOString(),
      baseFare: getBaseFare(),
      slots: random(0, 10),
    },
    {
      shippingLine: {
        id: 4,
        name: 'COKALIONG SHIPPING LINES INC.',
      },
      srcPort: {
        id: 10,
        name: 'Cebu',
      },
      destPort: {
        id: 0,
        name: 'Bacolod',
      },
      departureDateIso: today.toISOString(),
      baseFare: getBaseFare(),
      slots: random(0, 10),
    },
    {
      shippingLine: {
        id: 4,
        name: 'COKALIONG SHIPPING LINES INC.',
      },
      srcPort: {
        id: 10,
        name: 'Cebu',
      },
      destPort: {
        id: 0,
        name: 'Bacolod',
      },
      departureDateIso: today.toISOString(),
      baseFare: getBaseFare(),
      slots: random(0, 10),
    },
    {
      shippingLine: {
        id: 4,
        name: 'COKALIONG SHIPPING LINES INC.',
      },
      srcPort: {
        id: 10,
        name: 'Cebu',
      },
      destPort: {
        id: 0,
        name: 'Bacolod',
      },
      departureDateIso: today.toISOString(),
      baseFare: getBaseFare(),
      slots: random(0, 10),
    },
    {
      shippingLine: {
        id: 4,
        name: 'COKALIONG SHIPPING LINES INC.',
      },
      srcPort: {
        id: 15,
        name: 'Dumaguete',
      },
      destPort: {
        id: 36,
        name: 'Ozamiz',
      },
      departureDateIso: todayPlus5days,
      baseFare: getBaseFare(),
      slots: random(0, 10),
    },
    {
      shippingLine: {
        id: 4,
        name: 'COKALIONG SHIPPING LINES INC.',
      },
      srcPort: {
        id: 38,
        name: 'Palompon',
      },
      destPort: {
        id: 24,
        name: 'Iloilo',
      },
      departureDateIso: today.toISOString(),
      baseFare: getBaseFare(),
      slots: random(0, 10),
    },
    {
      shippingLine: {
        id: 4,
        name: 'COKALIONG SHIPPING LINES INC.',
      },
      srcPort: {
        id: 38,
        name: 'Palompon',
      },
      destPort: {
        id: 24,
        name: 'Iloilo',
      },
      departureDateIso: todayPlus5days,
      baseFare: getBaseFare(),
      slots: random(0, 10),
    },
    {
      shippingLine: {
        id: 10,
        name: 'SUPERCAT FAST FERRY CORP.',
      },
      srcPort: {
        id: 10,
        name: 'Cebu',
      },
      destPort: {
        id: 0,
        name: 'Bacolod',
      },
      departureDateIso: todayPlus5days,
      baseFare: getBaseFare(),
      slots: random(0, 10),
    },
    {
      shippingLine: {
        id: 10,
        name: 'SUPERCAT FAST FERRY CORP.',
      },
      srcPort: {
        id: 23,
        name: 'Iligan',
      },
      destPort: {
        id: 30,
        name: 'Masbate',
      },
      departureDateIso: today.toISOString(),
      baseFare: getBaseFare(),
      slots: random(0, 10),
    },
    {
      shippingLine: {
        id: 10,
        name: 'SUPERCAT FAST FERRY CORP.',
      },
      srcPort: {
        id: 55,
        name: 'Zamboanga',
      },
      destPort: {
        id: 33,
        name: 'Nasipit',
      },
      departureDateIso: today.toISOString(),
      baseFare: getBaseFare(),
      slots: random(0, 10),
    },
    {
      shippingLine: {
        id: 10,
        name: 'SUPERCAT FAST FERRY CORP.',
      },
      srcPort: {
        id: 55,
        name: 'Zamboanga',
      },
      destPort: {
        id: 33,
        name: 'Nasipit',
      },
      departureDateIso: todayPlus5days,
      baseFare: getBaseFare(),
      slots: random(0, 10),
    },
    {
      shippingLine: {
        id: 40,
        name: 'GOTHONG SOUTHERN SHIPPING LINES, INC.',
      },
      srcPort: {
        id: 10,
        name: 'Cebu',
      },
      destPort: {
        id: 0,
        name: 'Bacolod',
      },
      departureDateIso: todayPlus5days,
      baseFare: getBaseFare(),
      slots: random(0, 10),
    },
    {
      shippingLine: {
        id: 40,
        name: 'GOTHONG SOUTHERN SHIPPING LINES, INC.',
      },
      srcPort: {
        id: 6,
        name: 'Cagayan De Oro',
      },
      destPort: {
        id: 25,
        name: 'Isabel, Leyte',
      },
      departureDateIso: today.toISOString(),
      baseFare: getBaseFare(),
      slots: random(0, 10),
    },
    {
      shippingLine: {
        id: 40,
        name: 'GOTHONG SOUTHERN SHIPPING LINES, INC.',
      },
      srcPort: {
        id: 49,
        name: 'Surigao',
      },
      destPort: {
        id: 32,
        name: 'Manila',
      },
      departureDateIso: todayPlus5days,
      baseFare: getBaseFare(),
      slots: random(0, 10),
    },
    {
      shippingLine: {
        id: 40,
        name: 'GOTHONG SOUTHERN SHIPPING LINES, INC.',
      },
      srcPort: {
        id: 49,
        name: 'Surigao',
      },
      destPort: {
        id: 32,
        name: 'Manila',
      },
      departureDateIso: today.toISOString(),
      baseFare: getBaseFare(),
      slots: random(0, 10),
    },
  ];

  const [dateQuery, timeQuery] = split(departureDate, 'T');
  const totalPaxes = sum(values(paxes));
  const availableTripsFiltered = trips.filter(
    ({ srcPort, destPort, departureDateIso, slots, shippingLine }) => {
      const [date, time] = split(departureDateIso, 'T');
      const sameSrcPort = srcPort.name === srcPortName;
      const sameDestPort = destPort.name === destPortName;
      const sameDate = date === dateQuery;
      const slotAvailable = totalPaxes <= slots;
      const shippingLineFilter = find(shippingLines, shippingLine); //in prog

      console.log(`${totalPaxes} : ${slots}`);
      return (
        sameSrcPort &&
        sameDestPort &&
        sameDate &&
        slotAvailable &&
        shippingLineFilter
      );
    }
  );
  const totalItems = availableTripsFiltered.length;
  const totalPages = ceil(totalItems / 10);

  const sortedAvailableTrips =
    sort === 'basePrice'
      ? orderBy(availableTripsFiltered, ['baseFare'])
      : orderBy(availableTripsFiltered, ['departureDateIso']);

  const data: TripData[] = [];
  let availableTrips: Trip[] = [];
  forEach(sortedAvailableTrips, (trip, idx) => {
    const incrementOfTen = (idx + 1) % 10 === 0;
    const lastElement = idx + 1 === totalItems;

    availableTrips.push({
      ...trip,
      id: 1,
    });

    if (incrementOfTen || lastElement) {
      data.push({
        availableTrips,
        page: ceil((idx + 1) / 10),
      });
      availableTrips = [];
    }
  });

  return {
    data,
    totalPages,
    totalItems,
  };
}

export const getBaseFare = () => {
  return random(1000, 9999);
};
