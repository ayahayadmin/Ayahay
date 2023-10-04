'use client';
import styles from './page.module.scss';
import React from 'react';
import { Button, Typography, Select, Form, Spin } from 'antd';
import { getAllBookings } from '@/services/booking.service';
import { generateBookingCsv } from '@/services/csv.service';
import { useAuthState } from '@/hooks/auth';
import { redirect } from 'next/navigation';
import { useLoggedInAccount } from '@ayahay/hooks/auth';

const { Title } = Typography;

const lastThreeMonths: { label: string; value: string }[] = [];

for (let monthDiff = 0; monthDiff < 3; monthDiff++) {
  const then = new Date();
  then.setMonth(then.getMonth() - monthDiff);
  lastThreeMonths.push({
    label: then.toLocaleString('default', { month: 'long', year: 'numeric' }),
    value: then.toISOString(),
  });
}

export default function DownloadBookings() {
  const { loggedInAccount } = useLoggedInAccount();
  const { pending, isSignedIn, user, auth } = useAuthState();

  if (pending) {
    return <Spin size='large' className={styles['spinner']} />;
  }

  const allowedRoles = ['SuperAdmin', 'Admin'];
  if (!isSignedIn) {
    redirect('/');
  } else if (loggedInAccount && !allowedRoles.includes(loggedInAccount.role)) {
    redirect('/404');
  }

  const onFinish = (formValues: any) => {
    const monthIso = formValues.month;
    const requestedMonthDate = new Date(monthIso);
    const requestedMonth = requestedMonthDate.getMonth();
    const requestedYear = requestedMonthDate.getFullYear();

    const allBookings = getAllBookings();
    const requestedBookings = allBookings.filter((booking) => {
      const tripDepartureIso = booking?.trip?.departureDateIso;
      if (!tripDepartureIso) {
        return false;
      }
      const tripDepartureDate = new Date(tripDepartureIso);
      const tripDepartureMonth = tripDepartureDate.getMonth();
      const tripDepartureYear = tripDepartureDate.getFullYear();
      return (
        tripDepartureYear === requestedYear &&
        tripDepartureMonth === requestedMonth
      );
    });

    const url = URL.createObjectURL(generateBookingCsv(requestedBookings));

    // Create a link to download it
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.setAttribute('download', `${monthIso}.csv`);
    downloadLink.click();
  };

  return (
    <Form
      initialValues={{ month: lastThreeMonths[0].value }}
      className={styles['main-container']}
      onFinish={onFinish}
    >
      <Title level={1}>Download Bookings</Title>
      <Form.Item name='month' label='Month'>
        <Select options={lastThreeMonths}></Select>
      </Form.Item>

      <Button type='primary' htmlType='submit'>
        Download
      </Button>
    </Form>
  );
}
