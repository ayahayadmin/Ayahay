'use client';

import styles from './page.module.scss';
import { Typography } from 'antd';
import { useEffect, useState } from 'react';
import TripSummary from '@ayahay/components/descriptions/TripSummary';
import { useRouter } from 'next/navigation';
import { ITrip, IBooking } from '@ayahay/models';
import { getTrip } from '@/services/trip.service';
import CreateBookingForm from '@/app/bookings/create/createBookingForm';

const { Title } = Typography;

export default function CreateBooking() {
  const router = useRouter();
  const [trip, setTrip] = useState<ITrip>();

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

  const onComplete = (booking: IBooking) => {
    router.push(`/bookings/${booking.id}`);
  };

  return (
    <div>
      <Title level={1} className={styles['main-title']}>
        Create Booking
      </Title>
      <div className={styles['main-container']}>
        <div className={styles['passenger-info']}>
          <CreateBookingForm trip={trip} onComplete={onComplete} />
        </div>
        <article className={styles['trip-summary']}>
          <Title level={2}>Trip Summary</Title>
          <TripSummary trip={trip} />
        </article>
      </div>
    </div>
  );
}
