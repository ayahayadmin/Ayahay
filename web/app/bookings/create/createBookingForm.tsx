import { Form, Spin, Steps, Grid, notification, Modal, Button } from 'antd';
import styles from './createBookingForm.module.scss';
import { IBooking } from '@ayahay/models';
import PassengerInformationForm from '@/components/booking/PassengerInformationForm';
import React, { useState } from 'react';
import { DISCOUNT_TYPE } from '@ayahay/constants/enum';
import {
  createTentativeBooking,
  saveBookingInBrowser,
  requestBooking as _requestBooking,
} from '@/services/booking.service';
import BookingConfirmation from '@/components/booking/BookingConfirmation';
import { useTripFromSearchParams } from '@/hooks/trip';
import { startPaymentForBooking } from '@/services/payment.service';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { getAxiosError } from '@ayahay/services/error.service';
import { FieldError } from '@ayahay/http';
import { getInitialPassengerFormValue } from '@ayahay/services/form.service';
import { computeAge, computeBirthday } from '@ayahay/services/date.service';
import dayjs from 'dayjs';

const { useBreakpoint } = Grid;

interface CreateBookingFormProps {
  onComplete: (booking: IBooking) => void;
}

const steps = [
  { title: 'Passenger Information' },
  { title: 'Confirm Booking' },
];

export default function CreateBookingForm({
  onComplete,
}: CreateBookingFormProps) {
  const { loggedInAccount, hasPrivilegedAccess } = useAuth();
  const { tripIds, trips } = useTripFromSearchParams();
  const trip = trips?.[0];
  const screens = useBreakpoint();
  const [modal, contextHolder] = Modal.useModal();
  const [form] = Form.useForm();
  const vehicles = Form.useWatch(
    ['bookingTrips', 0, 'bookingTripVehicles'],
    form
  );
  const paymentGateway = Form.useWatch('paymentGateway', form);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [bookingPreview, setBookingPreview] = useState<IBooking>();
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const previousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const createTempBooking = async () => {
    setLoadingMessage(
      'Looking for available seats that match your preferences...'
    );

    if (trip === undefined) {
      onBookError('Trip is not defined');
      return;
    }

    try {
      const tentativeBooking = await createTentativeBooking(
        form.getFieldsValue(true)
      );
      setBookingPreview(tentativeBooking);
      nextStep();
    } catch (e: any) {
      onBookError(e);
    }

    setLoadingMessage('');
  };

  const onBookError = (e: any) => {
    const axiosError = getAxiosError<FieldError[]>(e);

    if (axiosError === undefined || axiosError.statusCode !== 400) {
      console.error(e);
      notification.error({
        message: 'Could not find a booking',
        description:
          'There seems to be an issue with finding a booking. Please try again in a few minutes or contact us at it@ayahay.com for assistance.',
      });
    } else {
      const fieldErrors = axiosError.message;
      form.setFields(
        fieldErrors.map((error) => ({
          name: error.fieldName,
          errors: [error.message],
        }))
      );
    }
  };

  const requestBooking = async (tentativeBookingId: number): Promise<void> => {
    setLoadingMessage('Creating booking request...');

    const contactEmail = form.getFieldValue('contactEmail');
    const createdBooking = await _requestBooking(
      tentativeBookingId,
      contactEmail
    );

    setLoadingMessage('');
    if (createdBooking === undefined) {
      onStartPaymentError();
      return;
    }

    // TODO: save in booking request browser cache

    informBookingRequested(createdBooking.id);
  };

  const informBookingRequested = (bookingId: string) => {
    const redirectUrl = `/bookings/requests/${bookingId}`;
    const partnerName = trip?.shippingLine?.name ?? 'our partner shipping line';

    modal.info({
      width: 'min(90vw, 512px)',
      centered: true,
      title: `Booking Requested`,
      icon: <InfoCircleOutlined />,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p>
            A booking has been successfully requested. Please wait for&nbsp;
            {partnerName} to process your request.
          </p>
          <p>
            You can keep track of the status of your booking request in the link
            below:
          </p>
          <Button type='link' href={redirectUrl} target='_blank'>
            View Booking Request
          </Button>
        </div>
      ),
      okText: 'Book Again',
      onOk: () => window.location.reload(),
    });
  };

  const payBooking = async (tentativeBookingId: number): Promise<void> => {
    setLoadingMessage('Initiating payment...');

    const contactEmail = form.getFieldValue('contactEmail');
    const contactMobile = form.getFieldValue('contactMobile');
    const consigneeName = form.getFieldValue('consigneeName');
    const response = await startPaymentForBooking(tentativeBookingId, {
      paymentGateway,
      contactEmail,
      contactMobile,
      consigneeName,
    });

    setLoadingMessage('');
    if (response === undefined) {
      onStartPaymentError();
      return;
    }

    if (!loggedInAccount) {
      saveBookingInBrowser(response.paymentReference);
    }
    informPaymentInitiation(
      response.paymentReference,
      vehicles?.length > 0,
      response.redirectUrl
    );
    window.open(response.redirectUrl);
  };

  const informPaymentInitiation = (
    transactionId: string,
    hasVehicle: boolean,
    redirectUrl: string
  ) => {
    modal.info({
      width: 'min(90vw, 512px)',
      centered: true,
      title: `You will be redirected to the secure ${paymentGateway} Payment Gateway to pay for your booking.`,
      icon: <InfoCircleOutlined />,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {hasVehicle && (
            <p style={{ fontSize: '16px' }}>
              <strong>
                IMPORTANT: PLEASE PRINT AND BRING THREE (3) COPIES OF THE BILL
                OF LADING (BOL) AFTER PAYMENT CONFIRMATION.
              </strong>
            </p>
          )}
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
          <Button type='link' href={redirectUrl} target='_blank'>
            I was not redirected
          </Button>
        </div>
      ),
      okText: 'Book Again',
      onOk: () => window.location.reload(),
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

  const onFieldsChange = (changedFields: any[], allFields: any[]) => {
    if (changedFields.some((field) => field.name.includes('voucherCode'))) {
      form.setFields([{ name: 'voucherCode', errors: [] }]);
    }

    // TODO: use onValuesChange, because onFieldsChange is called on validation for some reason
    const isFormValidating = changedFields.length > 1;
    if (!hasPrivilegedAccess || isFormValidating) {
      return;
    }

    const changedBirthdayField = changedFields.find((field) =>
      field.name.includes('birthdayIso')
    );
    if (changedBirthdayField !== undefined) {
      onBirthdayChange(changedBirthdayField);
    }

    const changedAgeField = changedFields.find((field) =>
      field.name.includes('age')
    );
    if (changedAgeField !== undefined) {
      onAgeChange(changedAgeField);
    }
  };

  const onBirthdayChange = (changedField: any) => {
    const passengerFieldName = changedField.name.slice(0, -1);
    const ageFieldName = [...passengerFieldName, 'age'];
    const age = computeAge(changedField.value);

    form.setFieldValue(ageFieldName, age);
    form.setFields([{ name: ageFieldName, errors: [] }]);

    updateDiscountTypeOnAgeChange(changedField, age);
  };

  const onAgeChange = (changedField: any) => {
    const passengerFieldName = changedField.name.slice(0, -1);
    const age = changedField.value;
    const birthdayFieldName = [...passengerFieldName, 'birthdayIso'];
    const birthday = computeBirthday(
      age,
      form.getFieldValue(birthdayFieldName)
    );

    form.setFieldValue(birthdayFieldName, dayjs(birthday));
    form.setFields([{ name: birthdayFieldName, errors: [] }]);

    updateDiscountTypeOnAgeChange(changedField, age);
  };

  const updateDiscountTypeOnAgeChange = (changedField: any, age: number) => {
    const passengerFieldName = changedField.name.slice(0, -1);
    const discountTypeFieldName = [...passengerFieldName, 'discountType'];

    const discountType = getDiscountTypeFromAge(age);
    form.setFieldValue(discountTypeFieldName, discountType);
    form.setFields([{ name: discountTypeFieldName, errors: [] }]);
  };

  return (
    <Form
      form={form}
      id={styles['create-booking-form']}
      initialValues={{
        bookingTrips: [
          {
            tripId: tripIds[0],
            passengerId: 0,
            bookingTripPassengers: [
              getInitialPassengerFormValue(tripIds[0], 0),
            ],
            bookingTripVehicles: [],
          },
        ],
        paymentGateway: 'PayMongo',
        bookingType: 'Single',
      }}
      onFieldsChange={onFieldsChange}
    >
      <Steps
        current={currentStep}
        items={items}
        direction={stepDirection}
        labelPlacement={stepDirection}
      />
      <Spin spinning={loadingMessage?.length > 0} tip={loadingMessage}>
        <div
          style={{
            display:
              steps[currentStep].title === 'Passenger Information'
                ? 'block'
                : 'none',
          }}
        >
          <PassengerInformationForm
            trip={trip}
            onNextStep={createTempBooking}
            onPreviousStep={previousStep}
          />
        </div>
        <div
          style={{
            display:
              steps[currentStep].title === 'Confirm Booking' ? 'block' : 'none',
          }}
        >
          <BookingConfirmation
            tentativeBooking={bookingPreview}
            hasPrivilegedAccess={hasPrivilegedAccess}
            onPreviousStep={previousStep}
            onRequestBooking={requestBooking}
            onStartPayment={payBooking}
          />
        </div>
      </Spin>
      {contextHolder}
    </Form>
  );
}

const getDiscountTypeFromAge = (age: number): DISCOUNT_TYPE | undefined => {
  if (age >= 60) {
    return DISCOUNT_TYPE.Senior;
  }

  if (age >= 18) {
    return undefined;
  }

  if (age >= 12) {
    return DISCOUNT_TYPE.Student;
  }

  if (age >= 3) {
    return DISCOUNT_TYPE.Child;
  }

  return DISCOUNT_TYPE.Infant;
};
