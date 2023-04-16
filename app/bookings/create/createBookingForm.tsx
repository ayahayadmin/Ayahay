import { Button, Form, Spin, Steps, Typography } from 'antd';
import styles from './createBookingForm.module.scss';
import Trip from '@/common/models/trip.model';
import PassengerInformationForm from '@/common/components/booking/PassengerInformationForm';
import React, { useState } from 'react';
import PassengerPreferencesForm from '@/common/components/booking/PassengerPreferencesForm';
import { DEFAULT_PASSENGER } from '@/common/constants/default';
import BookingSummary from '@/common/components/booking/BookingSummary';
import Passenger, {
  mockFather,
  toFormValue,
} from '@/common/models/passenger.model';
import Booking from '@/common/models/booking.model';
import { createTentativeBookingFromPassengerPreferences } from '@/common/services/booking.service';
import BookingConfirmation from '@/common/components/booking/BookingConfirmation';

interface CreateBookingFormProps {
  trip?: Trip;
}

const steps = [
  { title: 'Passenger Information' },
  { title: 'Passenger Preferences' },
  { title: 'Confirm Booking' },
];

export default function CreateBookingForm({ trip }: CreateBookingFormProps) {
  const [form] = Form.useForm();
  const passengers = Form.useWatch('passengers', form);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [bookingPreview, setBookingPreview] = useState<Booking>();

  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const previousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const findSeats = () => {
    setLoadingMessage(
      'Looking for available seats that match your preferences...'
    );
    setTimeout(() => {
      if (trip === undefined) {
        return;
      }
      const tentativeBooking = createTentativeBookingFromPassengerPreferences(
        trip?.id,
        passengers.map((passenger: Passenger) => {
          if (passenger.preferences) {
            passenger.preferences.passenger = passenger;
          }
          return passenger.preferences;
        })
      );
      setBookingPreview(tentativeBooking);
      setLoadingMessage('');
      nextStep();
    }, 3000);
  };

  const items = steps.map(({ title }) => ({ key: title, title: title }));

  return (
    <Form
      form={form}
      className={styles['main-container']}
      initialValues={{
        passengers: [DEFAULT_PASSENGER],
      }}
      onValuesChange={(changesValues, values) => console.log(values)}
      onFinish={(values) => console.log(values)}
    >
      <Steps current={currentStep} items={items} />
      <Spin spinning={loadingMessage?.length > 0} tip={loadingMessage}>
        <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
          <PassengerInformationForm
            onNextStep={nextStep}
            onPreviousStep={previousStep}
          />
        </div>
        <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
          <PassengerPreferencesForm
            trip={trip}
            onNextStep={findSeats}
            onPreviousStep={previousStep}
          />
        </div>
        <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
          <BookingConfirmation
            booking={bookingPreview}
            onPreviousStep={previousStep}
          />
        </div>
      </Spin>
    </Form>
  );
}
