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
import { getAxiosError } from '@ayahay/services/error.service';

const { Title } = Typography;

export default function DisbursementPage({ params }: any) {
  useAuthGuard(['ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin']);
  const { loggedInAccount } = useAuth();
  const [form] = Form.useForm();
  const [trip, setTrip] = useState<ITrip | undefined>();
  const [errorCode, setErrorCode] = useState<number | undefined>();
  const [api, contextHolder] = notification.useNotification();
  const tripId = params.id;

  useEffect(() => {
    if (loggedInAccount === null) {
      return;
    }
    fetchTrip(tripId);
  }, [loggedInAccount]);

  const fetchTrip = async (tripId: number): Promise<void> => {
    try {
      setTrip(await getTripDetails(Number(tripId)));
    } catch (e) {
      const axiosError = getAxiosError(e);
      if (axiosError === undefined) {
        setErrorCode(500);
      } else {
        setErrorCode(axiosError.statusCode);
      }
    }
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
      {errorCode === undefined && (
        <>
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
                {dayjs(trip.departureDateIso).format('MM/DD/YYYY h:mm A')}
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
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
        </>
      )}
      {errorCode === 404 && (
        <p className={styles['error-text']}>
          The trip does not exist. Try again after a few minutes or&nbsp;
          <Button
            type='link'
            href={`mailto:it@ayahay.com?subject=Trip Not Found`}
            className={styles['no-padding']}
          >
            contact us for assistance
          </Button>
          .
        </p>
      )}
      {errorCode === 403 && (
        <p className={styles['error-text']}>
          You are not authorized to view this page.&nbsp;
          <Button
            type='link'
            href={`mailto:it@ayahay.com?subject=I cannot access disbursements page`}
            className={styles['no-padding']}
          >
            Contact us for assistance
          </Button>
          &nbsp;if you think this is a mistake.
        </p>
      )}
      {errorCode === 500 && (
        <p className={styles['error-text']}>Something went wrong.</p>
      )}
    </div>
  );
}
