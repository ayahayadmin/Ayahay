'use client';
import React, { useEffect, useState } from 'react';
import { IShippingLineSchedule } from '@ayahay/models';
import { getSchedulesOfShippingLine } from '@/services/shipping-line.service';
import { Typography } from 'antd';
import CreateTripsFromScheduleForm from './createTripsFromScheduleForm';

const { Title } = Typography;

export default function CreateTripsFromSchedulesPage() {
  const [schedules, setSchedules] = useState<IShippingLineSchedule[]>([]);

  const fetchSchedules = async (): Promise<void> => {
    const shippingLineSchedules = await getSchedulesOfShippingLine();
    if (shippingLineSchedules === undefined) {
      return;
    }

    setSchedules(shippingLineSchedules);
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return (
    <div style={{ margin: '32px 64px' }}>
      <Title level={1}>Create Trips from Schedules</Title>
      <CreateTripsFromScheduleForm
        schedules={schedules}
      ></CreateTripsFromScheduleForm>
    </div>
  );
}
