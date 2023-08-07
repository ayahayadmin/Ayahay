'use client';

import styles from './page.module.scss';
import { Typography } from 'antd';
import TripSummary from '@ayahay/components/descriptions/TripSummary';
import { useRouter } from 'next/navigation';
import { IBooking } from '@ayahay/models';
import CreateBookingForm from '@/app/bookings/create/createBookingForm';
import { useTripFromSearchParams } from '@/hooks/trip';

const { Title } = Typography;

export default function CreateBooking() {
  const { trip } = useTripFromSearchParams();
  const router = useRouter();

  const onComplete = (booking: IBooking) => {
    router.push(`/bookings/${booking.id}`);
  };

  return (
    <div id={styles['create-booking-page']}>
      <Title level={1} className={styles['main-title']}>
        Create Booking
      </Title>
      <div className={styles['main-container']}>
        <div className={styles['passenger-info']}>
          <CreateBookingForm onComplete={onComplete} />
        </div>
        <article className={styles['trip-summary']}>
          <Title level={2}>Trip Summary</Title>
          <TripSummary trip={trip} />
        </article>
      </div>
    </div>
  );
}
