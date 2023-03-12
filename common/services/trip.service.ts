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
      shippingLine: 'Cokaliong',
      sourceLoc: 'Cebu',
      destinationLoc: 'Bacolod',
      departureDate: '2023-03-20',
    },
    {
      shippingLine: 'Cokaliong',
      sourceLoc: 'Cebu',
      destinationLoc: 'Bacolod',
      departureDate: '2023-03-20',
    },
    {
      shippingLine: 'Cokaliong',
      sourceLoc: 'Cebu',
      destinationLoc: 'Bacolod',
      departureDate: '2023-03-20',
    },
    {
      shippingLine: 'Cokaliong',
      sourceLoc: 'Cebu',
      destinationLoc: 'Bacolod',
      departureDate: '2023-03-20',
    },
    {
      shippingLine: 'Cokaliong',
      sourceLoc: 'Cebu',
      destinationLoc: 'Bacolod',
      departureDate: '2023-03-20',
    },
    {
      shippingLine: 'Cokaliong',
      sourceLoc: 'Cebu',
      destinationLoc: 'Bacolod',
      departureDate: '2023-03-20',
    },
    {
      shippingLine: 'Cokaliong',
      sourceLoc: 'Cebu',
      destinationLoc: 'Bacolod',
      departureDate: '2023-03-20',
    },
    {
      shippingLine: 'Cokaliong',
      sourceLoc: 'Cebu',
      destinationLoc: 'Bacolod',
      departureDate: '2023-03-20',
    },
    {
      shippingLine: 'Cokaliong',
      sourceLoc: 'Cebu',
      destinationLoc: 'Bacolod',
      departureDate: '2023-03-20',
    },
    {
      shippingLine: 'Cokaliong',
      sourceLoc: 'Cebu',
      destinationLoc: 'Bacolod',
      departureDate: '2023-03-20',
    },
    {
      shippingLine: 'Cokaliong',
      sourceLoc: 'Dumaguete',
      destinationLoc: 'Ozamiz',
      departureDate: '2023-03-25',
    },
    {
      shippingLine: 'Cokaliong',
      sourceLoc: 'Palompon',
      destinationLoc: 'Iloilo',
      departureDate: '2023-03-20',
    },
    {
      shippingLine: 'Cokaliong',
      sourceLoc: 'Palompon',
      destinationLoc: 'Iloilo',
      departureDate: '2023-03-25',
    },
    {
      shippingLine: 'Supercat',
      sourceLoc: 'Cebu',
      destinationLoc: 'Bacolod',
      departureDate: '2023-03-25',
    },
    {
      shippingLine: 'Supercat',
      sourceLoc: 'Iligan',
      destinationLoc: 'Masbate',
      departureDate: '2023-03-20',
    },
    {
      shippingLine: 'Supercat',
      sourceLoc: 'Zamboanga',
      destinationLoc: 'Nasipit',
      departureDate: '2023-03-20',
    },
    {
      shippingLine: 'Supercat',
      sourceLoc: 'Zamboanga',
      destinationLoc: 'Nasipit',
      departureDate: '2023-03-25',
    },
    {
      shippingLine: 'Gothong',
      sourceLoc: 'Cebu',
      destinationLoc: 'Bacolod',
      departureDate: '2023-03-25',
    },
    {
      shippingLine: 'Gothong',
      sourceLoc: 'Cagayan De Oro',
      destinationLoc: 'Isabel',
      departureDate: '2023-03-20',
    },
    {
      shippingLine: 'Gothong',
      sourceLoc: 'Surigao',
      destinationLoc: 'Manila',
      departureDate: '2023-03-25',
    },
    {
      shippingLine: 'Gothong',
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
