'use client';

import { Form, Skeleton, Typography } from 'antd';
import { useEffect, useState } from 'react';
import TripSummary from '@/app/bookings/create/tripSummary';
import { useRouter } from 'next/navigation';
import Trip from '@/common/models/trip.model';
import { getTrip } from '@/common/services/trip.service';

const { Title } = Typography;

export default function CreateBooking() {
  const router = useRouter();
  const [form] = Form.useForm();
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
    <Form form={form}>
      <Title level={1}>Create Booking</Title>
      <Skeleton loading={trip === undefined} active>
        <TripSummary trip={trip} />
      </Skeleton>
    </Form>
  );
}
