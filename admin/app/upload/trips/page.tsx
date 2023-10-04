'use client';
import styles from './page.module.scss';
import { InboxOutlined, DownloadOutlined } from '@ant-design/icons';
import React from 'react';
import { message, Button, Upload, Typography, Spin } from 'antd';
import { processTripCsv } from '@/services/csv.service';
import { ITrip } from '@ayahay/models';
import { addTrips } from '@/services/trip.service';
import { useAuthState } from '@/hooks/auth';
import { useLoggedInAccount } from '@ayahay/hooks/auth';
import { redirect } from 'next/navigation';

const { Title } = Typography;
const { Dragger } = Upload;

export default function UploadTrips() {
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

  const onUpload = (options: any) => {
    const { file, onProgress, onSuccess } = options;
    onProgress({ percent: 50 });
    setTimeout(() => {
      onProgress({ percent: 100 });
      processTripCsv(file, (trips: ITrip[]) => {
        onSuccess();
        onSuccessfulUpload(trips);
      });
    }, 1000);
  };

  const onSuccessfulUpload = (trips: ITrip[]) => {
    addTrips(trips);
    message.success(`Successfully uploaded ${trips.length} trips.`);
  };

  return (
    <div className={styles['main-container']}>
      <Title level={1}>Upload Schedule</Title>

      <Dragger
        name='file'
        multiple={true}
        action='https://www.mocky.io/v2/5cc8019d300000980a055e76'
        showUploadList={{
          showPreviewIcon: false,
          showDownloadIcon: false,
          showRemoveIcon: false,
        }}
        customRequest={onUpload}
      >
        <p className='ant-upload-drag-icon'>
          <InboxOutlined rev={undefined} />
        </p>
        <p className='ant-upload-text'>
          Click or drag schedule .csv file to this area to upload
        </p>
        <Button
          download
          href='/templates/schedules.csv'
          onClick={(e) => e.stopPropagation()}
          type='primary'
          shape='round'
          icon={<DownloadOutlined rev={undefined} />}
        >
          Download Template
        </Button>
        <p className='ant-upload-hint'></p>
      </Dragger>
    </div>
  );
}
