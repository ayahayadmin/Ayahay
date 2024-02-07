'use client';
import { Button, Form, Spin, Typography, notification } from 'antd';
import styles from './page.module.scss';
import dayjs from 'dayjs';
import Disbursements from '@/components/form/Disbursements';
import { createDisbursements } from '@/services/disbursement.service';
import { useAuthGuard } from '@/hooks/auth';
import { useEffect, useState } from 'react';
import { ITrip } from '@ayahay/models';
import { getTripDetails } from '@/services/trip.service';
import { useAuth } from '@/contexts/AuthContext';
import { getLocaleTimeString } from '@ayahay/services/date.service';

const { Title } = Typography;

export default function DisbursementPage({ params }: any) {
  useAuthGuard(['Staff', 'Admin', 'SuperAdmin']);
  const { loggedInAccount } = useAuth();
  const [form] = Form.useForm();
  const [trip, setTrip] = useState<ITrip | undefined>();
  const [api, contextHolder] = notification.useNotification();
  const tripId = params.id;

  useEffect(() => {
    if (loggedInAccount === null) {
      return;
    }
    fetchTrip(tripId);
  }, [loggedInAccount]);

  const fetchTrip = async (tripId: number): Promise<void> => {
    setTrip(await getTripDetails(Number(tripId)));
  };

  const handleDisbursementSubmit = async (values: any) => {
    if (values.disbursement.length === 0) {
      return;
    }
    try {
      await createDisbursements(tripId, values.disbursement);
      form.resetFields();
      api.success({
        message: 'Success',
        description: 'Disbursements saved successfully.',
      });
    } catch {
      api.error({
        message: 'Failed',
        description: 'Something went wrong.',
      });
    }
  };

  return (
    <div className={styles['main-container']}>
      <Title level={1} style={{ fontSize: 25 }}>
        Disbursements
      </Title>
      <Spin
        size='large'
        spinning={trip === undefined}
        className={styles['spinner']}
      />
      {trip && (
        <div>
          <div>
            <strong>Trip:</strong>&nbsp;{trip.srcPort?.name}&nbsp;to&nbsp;
            {trip.destPort?.name}
          </div>
          <div>
            <strong>Departure Date:</strong>&nbsp;
            {dayjs(trip.departureDateIso).format('MM/DD/YYYY')}&nbsp;at&nbsp;
            {getLocaleTimeString(trip.departureDateIso)}
          </div>
          <div>
            <strong>Voyage #:</strong>&nbsp;
            {trip.voyage?.number}
          </div>

          <Form
            form={form}
            initialValues={{
              disbursement: [{ date: dayjs(trip.departureDateIso) }],
            }}
            onFinish={handleDisbursementSubmit}
          >
            {contextHolder}
            <Disbursements tripDate={trip.departureDateIso} />
            <div>
              <Button type='primary' htmlType='submit'>
                Submit
              </Button>
            </div>
          </Form>
        </div>
      )}
    </div>
  );
}
