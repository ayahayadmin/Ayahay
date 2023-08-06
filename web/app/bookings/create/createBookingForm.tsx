import { Form, Spin, Steps, Grid, notification } from 'antd';
import styles from './createBookingForm.module.scss';
import { ITrip, IBooking, IPassenger } from '@ayahay/models';
import { DEFAULT_PASSENGER } from '@ayahay/constants/default';
import PassengerInformationForm from '@/components/booking/PassengerInformationForm';
import React, { useState } from 'react';
import PassengerPreferencesForm from '@/components/booking/PassengerPreferencesForm';
import { createTentativeBooking } from '@/services/booking.service';
import BookingConfirmation from '@/components/booking/BookingConfirmation';
import { useTripFromSearchParams } from '@/hooks/trip';

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
  const { trip } = useTripFromSearchParams();
  const screens = useBreakpoint();
  const [form] = Form.useForm();
  const passengers = Form.useWatch('passengers', form);
  const vehicles = Form.useWatch('vehicles', form);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [bookingPreview, setBookingPreview] = useState<IBooking>();

  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const previousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const findSeats = async () => {
    setLoadingMessage(
      'Looking for available seats that match your preferences...'
    );

    if (trip === undefined) {
      onBookError(new Error('Trip is not defined'));
      return;
    }

    try {
      const { data: tentativeBooking } = await createTentativeBooking(
        [trip?.id],
        passengers,
        passengers.map((passenger: IPassenger, index: number) => {
          // TODO: remove following 4 lines after back-end has been setup
          passenger.id = index;
          return passenger.preferences;
        }),
        vehicles
      );
      setBookingPreview(tentativeBooking);
      nextStep();
    } catch (e) {
      onBookError(e);
    }
    setLoadingMessage('');
  };

  const onBookError = (e: any) => {
    notification.error({
      message: 'Could not find a booking',
      description:
        'There seems to be an issue with finding a booking. Please try again in a few minutes or contact us at help@ayahay.com for assistance.',
    });
    console.error(e);
  };

  const items = steps.map(({ title }) => ({ key: title, title: title }));
  const stepDirection = screens.md ? 'horizontal' : 'vertical';

  return (
    <Form
      form={form}
      id={styles['create-booking-form']}
      initialValues={{
        passengers: [DEFAULT_PASSENGER],
        vehicles: [],
      }}
      onValuesChange={(changesValues, values) => console.log(values)}
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
            onNextStep={nextStep}
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
            onSuccessfulPayment={onComplete}
          />
        </div>
      </Spin>
    </Form>
  );
}
