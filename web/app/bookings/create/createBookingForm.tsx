import { Form, Spin, Steps, Typography } from 'antd';
import styles from './createBookingForm.module.scss';
import { ITrip, IBooking, IPassenger } from '@ayahay/models';
import { DEFAULT_PASSENGER } from '@ayahay/constants/default';
import PassengerInformationForm from '@/components/booking/PassengerInformationForm';
import React, { useState } from 'react';
import PassengerPreferencesForm from '@/components/booking/PassengerPreferencesForm';
import { createTentativeBookingFromPassengerPreferences } from '@/services/booking.service';
import BookingConfirmation from '@/components/booking/BookingConfirmation';

interface CreateBookingFormProps {
  trip?: ITrip;
  onComplete: (booking: IBooking) => void;
}

const steps = [
  { title: 'Passenger Information' },
  { title: 'Passenger Preferences' },
  { title: 'Confirm Booking' },
];

export default function CreateBookingForm({
  trip,
  onComplete,
}: CreateBookingFormProps) {
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
        passengers.map((passenger: IPassenger, index: number) => {
          // TODO: remove following 4 lines after back-end has been setup
          passenger.id = index;
          if (passenger.preferences) {
            passenger.preferences.passengerId = index;
          }

          return passenger.preferences;
        }),
        vehicles
      );
      if (tentativeBooking === undefined) {
        return;
      }

      // TODO: remove this after back-end has been set up
      tentativeBooking.bookingPassengers?.forEach(
        (booking) =>
          (booking.passenger = passengers.find(
            (passenger: IPassenger) => passenger.id === booking.passengerId
          ))
      );
      setBookingPreview(tentativeBooking);
      setLoadingMessage('');
      nextStep();
    }, 1000);
  };

  const items = steps.map(({ title }) => ({ key: title, title: title }));

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
            onSuccessfulPayment={onComplete}
          />
        </div>
      </Spin>
    </Form>
  );
}
