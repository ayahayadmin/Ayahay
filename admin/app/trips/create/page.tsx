'use client';
import React, { useEffect, useState } from 'react';
import { IShippingLineSchedule } from '@ayahay/models';
import { getSchedulesOfShippingLine } from '@/services/shipping-line.service';
import { Spin, Typography } from 'antd';
import CreateTripsFromScheduleForm from './createTripsFromScheduleForm';
import { useAuthState } from '@/hooks/auth';
import styles from './page.module.scss';
import { redirect } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const { Title } = Typography;

export default function CreateTripsFromSchedulesPage() {
  const { loggedInAccount } = useAuth();
  const { pending, isSignedIn } = useAuthState();
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

  if (pending) {
    return <Spin size='large' className={styles['spinner']} />;
  }

  const allowedRoles = ['SuperAdmin', 'ShippingLineAdmin'];
  if (!isSignedIn) {
    redirect('/');
  } else if (loggedInAccount && !allowedRoles.includes(loggedInAccount.role)) {
    redirect('/403');
  }

  return (
    <div style={{ margin: '32px 64px' }}>
      <Title level={1}>Create Trips from Schedules</Title>
      <CreateTripsFromScheduleForm
        schedules={schedules}
      ></CreateTripsFromScheduleForm>
    </div>
  );
}
