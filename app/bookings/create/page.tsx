'use client';

import { Typography } from 'antd';
import { useEffect, useState } from 'react';
import TripSummary from '@/common/components/booking/TripSummary';
import { useRouter } from 'next/navigation';
import Trip from '@/common/models/trip.model';
import { getTrip } from '@/common/services/trip.service';
import CreateBookingForm from '@/app/bookings/create/createBookingForm';

const { Title } = Typography;

export default function CreateBooking() {
  const router = useRouter();
  const [trip, setTrip] = useState<Trip>();

  const onPageLoad = () => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());

    const tripId = params?.tripId;

    if (tripId === undefined) {
      router.push(`/trips`);
      return;
    }

    setTimeout(() => {
      setTrip(getTrip(+tripId));
    }, 1000);
  };

  useEffect(onPageLoad, []);

  return (
    <div>
      <Title level={1}>Create Booking</Title>
      <article>
        <Title level={2}>Trip Summary</Title>
        <TripSummary trip={trip} />
      </article>
      <CreateBookingForm trip={trip} />
    </div>
  );
}
