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
  const { trips } = useTripFromSearchParams();
  const trip = trips?.[0];
  const router = useRouter();

  const onComplete = (booking: IBooking) => {
    router.push(`/bookings/${booking.id}`);
  };

  if (trip && trip.status !== 'Awaiting') {
    router.push('/');
  }

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
          {trips &&
            trips.map((trip, index) => (
              <div key={trip.id}>
                {trips.length > 1 && <Title level={3}>Trip {index + 1}</Title>}
                <TripSummary trip={trip} />
              </div>
            ))}
        </article>
      </div>
    </div>
  );
}
