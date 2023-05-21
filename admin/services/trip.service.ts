import {
  IBooking,
  ITrip,
  mockBookings,
  mockTrip,
  mockTrips,
  TripData,
  TripPaxes,
} from '@ayahay/models';
import dayjs from 'dayjs';
import {
  ceil,
  forEach,
  includes,
  isEmpty,
  orderBy,
  random,
  split,
  sum,
  values,
} from 'lodash';
import { SEAT_TYPE } from '@ayahay/constants/enum';
import { getAllBookings } from '@/services/booking.service';

export function getTrip(tripId: number): ITrip {
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
      slots: random(1, 10),
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
      slots: random(1, 10),
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
      slots: random(1, 10),
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
      slots: random(1, 10),
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
      slots: random(1, 10),
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
      slots: random(1, 10),
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
      slots: random(1, 10),
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
      slots: random(1, 10),
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
      slots: random(1, 10),
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
      slots: random(1, 10),
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
      slots: random(1, 10),
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
      slots: random(1, 10),
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
      slots: random(1, 10),
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
      departureDateIso: today.toISOString(),
      baseFare: getBaseFare(),
      slots: random(1, 10),
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
      slots: random(1, 10),
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
      slots: random(1, 10),
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
      slots: random(1, 10),
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
      departureDateIso: today.toISOString(),
      baseFare: getBaseFare(),
      slots: random(1, 10),
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
      slots: random(1, 10),
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
      slots: random(1, 10),
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
      slots: random(1, 10),
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
      const shippingLineFilter = isEmpty(shippingLineIds)
        ? true
        : includes(shippingLineIds, shippingLine.id);

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
  let availableTrips: ITrip[] = [];
  forEach(sortedAvailableTrips, (trip, idx) => {
    const incrementOfTen = (idx + 1) % 10 === 0;
    const lastElement = idx + 1 === totalItems;

    availableTrips.push({
      ...trip,
      id: 1,
      availableSeatTypes: getAvailableSeats(),
      meals: ['Tapsilog', 'Bacsilog', 'Longsilog'],
      shipId: 1,
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

export function getAllTrips(): ITrip[] {
  const trips = localStorage.getItem('trips');
  if (trips === null) {
    localStorage.setItem('bookings', JSON.stringify(mockTrips));
    return mockTrips;
  }
  return JSON.parse(trips);
}

export function addTrips(newTrips: ITrip[]) {
  const trips = getAllTrips();
  trips.push(...newTrips);
  localStorage.setItem('trips', JSON.stringify(trips));
}

export const getBaseFare = () => {
  return random(1000, 9999);
};

export const getAvailableSeats = (): (keyof typeof SEAT_TYPE)[] => {
  return ['Window', 'SingleBed'];
};
