import Trip, {
  AvailableTrips,
  mockTrip,
  TripData,
} from '@/common/models/trip.model';
import { ceil, filter, forEach } from 'lodash';

export function getTrip(tripId: number): Trip {
  return mockTrip;
}

export function getTrips(sourceLoc: string, destinationLoc: string) {
  const trips = [
    {
      shippingLine: 'COKALIONG SHIPPING LINES INC.',
      sourceLoc: 'Cebu',
      destinationLoc: 'Bacolod',
      departureDate: '2023-03-20',
    },
    {
      shippingLine: 'COKALIONG SHIPPING LINES INC.',
      sourceLoc: 'Cebu',
      destinationLoc: 'Bacolod',
      departureDate: '2023-03-20',
    },
    {
      shippingLine: 'COKALIONG SHIPPING LINES INC.',
      sourceLoc: 'Cebu',
      destinationLoc: 'Bacolod',
      departureDate: '2023-03-20',
    },
    {
      shippingLine: 'COKALIONG SHIPPING LINES INC.',
      sourceLoc: 'Cebu',
      destinationLoc: 'Bacolod',
      departureDate: '2023-03-20',
    },
    {
      shippingLine: 'COKALIONG SHIPPING LINES INC.',
      sourceLoc: 'Cebu',
      destinationLoc: 'Bacolod',
      departureDate: '2023-03-20',
    },
    {
      shippingLine: 'COKALIONG SHIPPING LINES INC.',
      sourceLoc: 'Cebu',
      destinationLoc: 'Bacolod',
      departureDate: '2023-03-20',
    },
    {
      shippingLine: 'COKALIONG SHIPPING LINES INC.',
      sourceLoc: 'Cebu',
      destinationLoc: 'Bacolod',
      departureDate: '2023-03-20',
    },
    {
      shippingLine: 'COKALIONG SHIPPING LINES INC.',
      sourceLoc: 'Cebu',
      destinationLoc: 'Bacolod',
      departureDate: '2023-03-20',
    },
    {
      shippingLine: 'COKALIONG SHIPPING LINES INC.',
      sourceLoc: 'Cebu',
      destinationLoc: 'Bacolod',
      departureDate: '2023-03-20',
    },
    {
      shippingLine: 'COKALIONG SHIPPING LINES INC.',
      sourceLoc: 'Cebu',
      destinationLoc: 'Bacolod',
      departureDate: '2023-03-20',
    },
    {
      shippingLine: 'COKALIONG SHIPPING LINES INC.',
      sourceLoc: 'Dumaguete',
      destinationLoc: 'Ozamiz',
      departureDate: '2023-03-25',
    },
    {
      shippingLine: 'COKALIONG SHIPPING LINES INC.',
      sourceLoc: 'Palompon',
      destinationLoc: 'Iloilo',
      departureDate: '2023-03-20',
    },
    {
      shippingLine: 'COKALIONG SHIPPING LINES INC.',
      sourceLoc: 'Palompon',
      destinationLoc: 'Iloilo',
      departureDate: '2023-03-25',
    },
    {
      shippingLine: 'SUPERCAT FAST FERRY CORP.',
      sourceLoc: 'Cebu',
      destinationLoc: 'Bacolod',
      departureDate: '2023-03-25',
    },
    {
      shippingLine: 'SUPERCAT FAST FERRY CORP.',
      sourceLoc: 'Iligan',
      destinationLoc: 'Masbate',
      departureDate: '2023-03-20',
    },
    {
      shippingLine: 'SUPERCAT FAST FERRY CORP.',
      sourceLoc: 'Zamboanga',
      destinationLoc: 'Nasipit',
      departureDate: '2023-03-20',
    },
    {
      shippingLine: 'SUPERCAT FAST FERRY CORP.',
      sourceLoc: 'Zamboanga',
      destinationLoc: 'Nasipit',
      departureDate: '2023-03-25',
    },
    {
      shippingLine: 'GOTHONG SOUTHERN SHIPPING LINES, INC.',
      sourceLoc: 'Cebu',
      destinationLoc: 'Bacolod',
      departureDate: '2023-03-25',
    },
    {
      shippingLine: 'GOTHONG SOUTHERN SHIPPING LINES, INC.',
      sourceLoc: 'Cagayan De Oro',
      destinationLoc: 'Isabel',
      departureDate: '2023-03-20',
    },
    {
      shippingLine: 'GOTHONG SOUTHERN SHIPPING LINES, INC.',
      sourceLoc: 'Surigao',
      destinationLoc: 'Manila',
      departureDate: '2023-03-25',
    },
    {
      shippingLine: 'GOTHONG SOUTHERN SHIPPING LINES, INC.',
      sourceLoc: 'Surigao',
      destinationLoc: 'Manila',
      departureDate: '2023-03-20',
    },
  ];

  const availableTripsFiltered = filter(trips, { sourceLoc, destinationLoc });
  const totalItems = availableTripsFiltered.length;
  const totalPages = ceil(totalItems / 10);

  const data: TripData[] = [];
  let availableTrips: AvailableTrips[] = [];
  forEach(availableTripsFiltered, (trip, idx) => {
    const incrementOfTen = (idx + 1) % 10 === 0;
    const lastElement = idx + 1 === totalItems;

    availableTrips.push(trip);

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
