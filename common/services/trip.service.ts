import Trip, { mockTrip, TripData } from '@/common/models/trip.model';
import { ceil, filter, forEach } from 'lodash';

export function getTrip(tripId: number): Trip {
  return mockTrip;
}

export function getTrips(srcPortName: string, destPortName: string) {
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
      departureDateIso: '2023-03-20',
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
      departureDateIso: '2023-03-20',
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
      departureDateIso: '2023-03-20',
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
      departureDateIso: '2023-03-20',
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
      departureDateIso: '2023-03-20',
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
      departureDateIso: '2023-03-20',
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
      departureDateIso: '2023-03-20',
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
      departureDateIso: '2023-03-20',
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
      departureDateIso: '2023-03-20',
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
      departureDateIso: '2023-03-20',
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
      departureDateIso: '2023-03-25',
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
      departureDateIso: '2023-03-20',
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
      departureDateIso: '2023-03-25',
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
      departureDateIso: '2023-03-25',
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
      departureDateIso: '2023-03-20',
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
      departureDateIso: '2023-03-20',
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
      departureDateIso: '2023-03-25',
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
      departureDateIso: '2023-03-25',
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
      departureDateIso: '2023-03-20',
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
      departureDateIso: '2023-03-25',
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
      departureDateIso: '2023-03-20',
    },
  ];

  const availableTripsFiltered = filter(trips, {
    srcPort: { name: srcPortName },
    destPort: { name: destPortName },
  });
  const totalItems = availableTripsFiltered.length;
  const totalPages = ceil(totalItems / 10);

  const data: TripData[] = [];
  let availableTrips: Trip[] = [];
  forEach(availableTripsFiltered, (trip, idx) => {
    const incrementOfTen = (idx + 1) % 10 === 0;
    const lastElement = idx + 1 === totalItems;

    availableTrips.push({
      ...trip,
      id: 1,
      baseFare: getBaseFare(),
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
  return 9999;
};
