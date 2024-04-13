'use client';
import styles from './page.module.scss';
import { InboxOutlined, DownloadOutlined } from '@ant-design/icons';
import React from 'react';
import { message, Button, Upload, Typography, Spin } from 'antd';
import { processBookingCsv } from '@/services/csv.service';
import { IBooking } from '@ayahay/models';
import { useAuthState } from '@/hooks/auth';
import { redirect } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const { Title } = Typography;
const { Dragger } = Upload;

export default function UploadBookings() {
  const { loggedInAccount } = useAuth();
  const { pending, isSignedIn, user, auth } = useAuthState();

  if (pending) {
    return <Spin size='large' className={styles['spinner']} />;
  }

  const allowedRoles = ['SuperAdmin', 'ShippingLineAdmin'];
  if (!isSignedIn) {
    redirect('/');
  } else if (loggedInAccount && !allowedRoles.includes(loggedInAccount.role)) {
    redirect('/403');
  }

  const onUpload = (options: any) => {
    const { file, onProgress, onSuccess } = options;
    onProgress({ percent: 50 });
    setTimeout(() => {
      onProgress({ percent: 100 });
      processBookingCsv(file, (bookings: IBooking[]) => {
        onSuccess();
        onSuccessfulUpload(bookings);
      });
    }, 1000);
  };

  const onSuccessfulUpload = (bookings: IBooking[]) => {
    message.success(`Successfully uploaded ${bookings.length} bookings.`);
  };

  return (
    <div className={styles['main-container']}>
      <Title level={1}>Upload Bookings</Title>

      <Dragger
        name='file'
        multiple={true}
        showUploadList={{
          showPreviewIcon: false,
          showDownloadIcon: false,
          showRemoveIcon: false,
        }}
        customRequest={onUpload}
      >
        <p className='ant-upload-drag-icon'>
          <InboxOutlined />
        </p>
        <p className='ant-upload-text'>
          Click or drag bookings .csv file to this area to upload
        </p>
        <Button
          download
          href='/templates/bookings.csv'
          onClick={(e) => e.stopPropagation()}
          type='primary'
          shape='round'
          icon={<DownloadOutlined />}
        >
          Download Template
        </Button>
        <p className='ant-upload-hint'></p>
      </Dragger>
    </div>
  );
}
