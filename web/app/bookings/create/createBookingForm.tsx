import { Form, Spin, Steps, Grid, notification, Modal } from 'antd';
import styles from './createBookingForm.module.scss';
import { IAccount, IBooking, IPassenger } from '@ayahay/models';
import PassengerInformationForm from '@/components/booking/PassengerInformationForm';
import React, { useEffect, useState } from 'react';
import PassengerPreferencesForm from '@/components/booking/PassengerPreferencesForm';
import {
  createTentativeBooking,
  getBookingById,
} from '@/services/booking.service';
import BookingConfirmation from '@/components/booking/BookingConfirmation';
import { useTripFromSearchParams } from '@/hooks/trip';
import { startPaymentForBooking } from '@/services/payment.service';
import { InfoCircleOutlined } from '@ant-design/icons';
import { invalidateItem } from '@ayahay/services/cache.service';
import { useAuth } from '@/app/contexts/AuthContext';
import { getMyAccountInformation } from '@ayahay/services/account.service';
import { useRouter } from 'next/navigation';
import { useLoggedInAccount } from '@ayahay/hooks/auth';

const { useBreakpoint } = Grid;

interface CreateBookingFormProps {
  onComplete: (booking: IBooking) => void;
}

const steps = [
  { title: 'Passenger Information' },
  { title: 'Passenger Preferences' },
  { title: 'Confirm Booking' },
];

export default function CreateBookingForm({
  onComplete,
}: CreateBookingFormProps) {
  const { loggedInAccount } = useLoggedInAccount();
  const { trip } = useTripFromSearchParams();
  const screens = useBreakpoint();
  const [modal, contextHolder] = Modal.useModal();
  const [form] = Form.useForm();
  const passengers = Form.useWatch('passengers', form);
  const vehicles = Form.useWatch('vehicles', form);
  const preferences = Form.useWatch('preferences', form);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [bookingPreview, setBookingPreview] = useState<IBooking>();
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const previousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const initializePreferences = async () => {
    const preferences = passengers.map((_: any) => ({}));
    form.setFieldValue('preferences', preferences);
    nextStep();
  };

  const findSeats = async () => {
    setLoadingMessage(
      'Looking for available seats that match your preferences...'
    );

    if (trip === undefined) {
      console.error('Trip is not defined');
      onBookError();
      return;
    }

    const tentativeBooking = await createTentativeBooking(
      [trip?.id],
      passengers,
      preferences,
      vehicles
    );

    if (tentativeBooking === undefined) {
      onBookError();
    }

    setBookingPreview(tentativeBooking);
    nextStep();
    setLoadingMessage('');
  };

  const onBookError = () => {
    notification.error({
      message: 'Could not find a booking',
      description:
        'There seems to be an issue with finding a booking. Please try again in a few minutes or contact us at help@ayahay.com for assistance.',
    });
  };

  const payBooking = async (tentativeBookingId: number): Promise<void> => {
    setLoadingMessage('Initiating payment...');

    const response = await startPaymentForBooking(tentativeBookingId);

    setLoadingMessage('');
    if (response === undefined) {
      onStartPaymentError();
      return;
    }

    informPaymentInitiation(response.paymentReference);
    window.open(response.redirectUrl);

    // we cache saved passengers and vehicles in loggedInAccount. we invalidate this to
    // ensure that the fetched data will include the passengers & vehicles created from this booking
    invalidateItem('loggedInAccount');
  };

  const informPaymentInitiation = (transactionId: string) => {
    modal.info({
      width: 'min(90vw, 512px)',
      centered: true,
      title:
        'You will be redirected to the secure Dragonpay Payment Gateway to pay for your booking.',
      icon: <InfoCircleOutlined />,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p>
            You can safely close this tab or book again by clicking the button
            below.
          </p>
          <p>
            For any concerns, please email us at it@ayahay.com with the subject
            header:
          </p>
          <p>
            <strong>Booking {transactionId.toUpperCase()}</strong>
          </p>
        </div>
      ),
      okText: 'Book Again',
      onOk: () => window.location.reload(),
    });
  };

  const informFullyBooked = () => {
    modal.info({
      width: 'min(90vw, 512px)',
      centered: true,
      title: 'The selected trip is now fully booked.',
      icon: <InfoCircleOutlined />,
      content: <p>You will now be redirected to the landing page.</p>,
      onOk: () => window.location.replace('/'),
    });
  };

  const onStartPaymentError = () => {
    notification.error({
      message: 'Something went wrong.',
      description:
        'There seems to be an issue with the payment. Please try again in a few minutes or contact us at help@ayahay.com for assistance.',
    });
  };

  const items = steps.map(({ title }) => ({ key: title, title: title }));
  const stepDirection = screens.md ? 'horizontal' : 'vertical';

  return (
    <Form
      form={form}
      id={styles['create-booking-form']}
      initialValues={{
        passengers: [{}],
        vehicles: [],
        preferences: [],
      }}
      onFinish={(values) => console.log(values)}
    >
      <Steps
        current={currentStep}
        items={items}
        direction={stepDirection}
        labelPlacement={stepDirection}
      />
      <Spin spinning={loadingMessage?.length > 0} tip={loadingMessage}>
        <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
          <PassengerInformationForm
            loggedInAccount={loggedInAccount}
            onNextStep={initializePreferences}
            onPreviousStep={previousStep}
          />
        </div>
        <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
          <PassengerPreferencesForm
            onNextStep={findSeats}
            onPreviousStep={previousStep}
          />
        </div>
        <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
          <BookingConfirmation
            tentativeBooking={bookingPreview}
            onPreviousStep={previousStep}
            onStartPayment={payBooking}
          />
        </div>
      </Spin>
      {contextHolder}
    </Form>
  );
}
