'use client';
import styles from './page.module.scss';
import React from 'react';
import { Button, Typography, Select, Form } from 'antd';
import { getBookingsToDownload } from '@/services/booking.service';
import { generateBookingCsv } from '@/services/csv.service';
import { useAuthGuard } from '@/hooks/auth';
import { IBooking } from '@ayahay/models';

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
  useAuthGuard(['Staff', 'Admin', 'SuperAdmin']);
  const onFinish = async (formValues: any) => {
    const monthIso = formValues.month;
    const requestedMonthDate = new Date(monthIso);
    const requestedMonth = requestedMonthDate.getMonth();
    const requestedYear = requestedMonthDate.getFullYear();

    const allBookings: IBooking[] = await getBookingsToDownload(
      requestedMonth,
      requestedYear
    );

    const generateCsv = await generateBookingCsv(allBookings);

    if (!generateCsv) {
      return new Error('CSV Generation Failed');
    }
    const url = URL.createObjectURL(generateCsv);

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
