import useSWR from 'swr';
import { getTrip } from '@/services/trip.service';
import { useSearchParams } from 'next/navigation';

export function useTripFromSearchParams() {
  const searchParams = useSearchParams();
  const params = Object.fromEntries(searchParams.entries());

  const { data, error, isLoading } = useSWR(
    { tripId: +params.tripId },
    ({ tripId }) => getTrip(tripId)
  );
  return {
    trip: data,
    isLoading,
    error: error,
  };
}
