import { Button, Form, Spin, Steps, Typography } from 'antd';
import styles from './createBookingForm.module.scss';
import Trip from '@/common/models/trip.model';
import PassengerInformationForm from '@/common/components/booking/PassengerInformationForm';
import React, { useState } from 'react';
import PassengerPreferencesForm from '@/common/components/booking/PassengerPreferencesForm';
import { DEFAULT_PASSENGER } from '@/common/constants/default';
import BookingSummary from '@/common/components/booking/BookingSummary';
import Passenger, { mockFather, toFormValue } from '@/common/models/passenger';
import Booking from '@/common/models/booking.model';
import { createTentativeBookingFromPassengerPreferences } from '@/common/services/booking.service';

const { Title } = Typography;

interface CreateBookingFormProps {
  trip?: Trip;
}

const steps = [
  { title: 'Passenger Information' },
  { title: 'Passenger Preferences' },
  { title: 'Review Booking' },
  { title: 'Confirm Booking' },
];

export default function CreateBookingForm({ trip }: CreateBookingFormProps) {
  const [form] = Form.useForm();
  const passengers = Form.useWatch('passengers', form);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [loggedInPassenger, setLoggedInPassenger] = useState<Passenger>();
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
        passengers.map((passenger: Passenger) => passenger.preferences)
      );
      setBookingPreview(tentativeBooking);
      setLoadingMessage('');
      nextStep();
    }, 5000);
  };

  const onLogin = () => {
    setLoggedInPassenger(mockFather);
    form.setFieldValue(['passengers', 0], toFormValue(mockFather));
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
          <Title level={2}>Passenger Information</Title>
          <Button type='link' onClick={() => onLogin()}>
            Have an account? Log in to book faster.
          </Button>
          <PassengerInformationForm
            loggedInPassenger={loggedInPassenger}
            onNextStep={nextStep}
            onPreviousStep={previousStep}
          />
        </div>
        <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
          <Title level={2}>Passenger Preferences</Title>
          <PassengerPreferencesForm
            trip={trip}
            onNextStep={findSeats}
            onPreviousStep={previousStep}
          />
        </div>
        <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
          <Title level={2}>Review Booking</Title>
          <BookingSummary booking={bookingPreview} />
          <div>
            <Button type='primary' onClick={() => nextStep()}>
              Next
            </Button>
          </div>
        </div>
      </Spin>
    </Form>
  );
}
