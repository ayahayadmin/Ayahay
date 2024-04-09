import { IBooking } from '@ayahay/models/booking.model';
import React from 'react';
import BookingSummary from '@ayahay/components/descriptions/BookingSummary';
import { Button, Form, Input, Radio, Typography } from 'antd';
import { useAuth } from '@/contexts/AuthContext';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface BookingConfirmationProps {
  tentativeBooking?: IBooking;
  hasPrivilegedAccess: boolean;
  onRequestBooking?: (tentativeBookingId: number) => void;
  onStartPayment?: (tentativeBookingId: number) => void;
  onPreviousStep?: () => void;
}

export default function BookingConfirmation({
  tentativeBooking,
  hasPrivilegedAccess,
  onPreviousStep,
  onRequestBooking,
  onStartPayment,
}: BookingConfirmationProps) {
  const form = Form.useFormInstance();

  const passengers = Form.useWatch(
    ['bookingTrips', 0, 'bookingTripPassengers'],
    form
  );
  const vehicles = Form.useWatch(
    ['bookingTrips', 0, 'bookingTripVehicles'],
    form
  );
  const { loggedInAccount } = useAuth();

  const isBookingRequestFlow = false;

  const onClickRequestBooking = async () => {
    const validationResult = await doFinalValidation();
    if (!onRequestBooking || !validationResult) {
      return;
    }

    onRequestBooking(tentativeBooking?.id as any);
  };

  const onClickPay = async () => {
    const validationResult = await doFinalValidation();
    if (!onStartPayment || !validationResult) {
      return;
    }
    onStartPayment(tentativeBooking?.id as any);
  };

  const doFinalValidation = async () => {
    if (tentativeBooking === undefined) {
      return false;
    }

    try {
      await form.validateFields([
        ['contactEmail'],
        ['contactMobile'],
        ['consigneeName'],
      ]);
    } catch {
      return false;
    }

    return true;
  };

  const payButtonAction = hasPrivilegedAccess ? 'Receive' : 'Pay';

  return (
    <div>
      <Title level={2}>Confirm Booking</Title>
      <div style={{ margin: '32px 0' }}>
        {tentativeBooking && (
          <BookingSummary
            booking={tentativeBooking}
            showTripSummary={false}
            titleLevel={3}
          />
        )}
        {!tentativeBooking && (
          <p>
            Something went wrong. Please book again or contact a system
            administrator if the issue persists.
          </p>
        )}
      </div>
      {!loggedInAccount && (
        <div>
          <Title level={3} style={{ marginBottom: '24px' }}>
            Contact Information
          </Title>
          <Form.Item
            name='contactEmail'
            label='Email Address'
            tooltip={{
              title:
                'We will send booking updates to this email (e.g. payment confirmation, cancellation, etc.)',
              icon: <InfoCircleOutlined />,
            }}
            colon={false}
            rules={[
              { required: true, type: 'email', message: 'Missing email' },
            ]}
          >
            <Input
              placeholder='john@example.com'
              type='email'
              style={{ width: 256 }}
            />
          </Form.Item>
          <Form.Item
            name='contactMobile'
            label='Mobile Number'
            tooltip={{
              title:
                'We will send booking updates to this number (e.g. payment confirmation, cancellation, etc.)',
              icon: <InfoCircleOutlined />,
            }}
            colon={false}
            rules={[{ required: true, message: 'Missing mobile number' }]}
          >
            <Input
              placeholder='09171234567'
              type='tel'
              style={{ width: 256 }}
            />
          </Form.Item>
        </div>
      )}
      {vehicles?.length > 0 && (
        <div>
          <Form.Item
            name='consigneeName'
            label='Consignee'
            colon={false}
            rules={[{ required: true, message: 'Missing consignee' }]}
          >
            {passengers.length > 0 && (
              <Radio.Group>
                {passengers.map(({ passenger }: any) => (
                  <Radio
                    value={`${passenger?.firstName} ${passenger?.lastName}`}
                  >{`${passenger?.firstName} ${passenger?.lastName}`}</Radio>
                ))}
              </Radio.Group>
            )}
            {passengers.length === 0 && (
              <Input type='text' style={{ width: 256 }} />
            )}
          </Form.Item>
        </div>
      )}
      {!hasPrivilegedAccess && !isBookingRequestFlow && (
        <div>
          <Form.Item name='paymentGateway' label='Payment Method' colon={false}>
            <Radio.Group>
              <Radio value='PayMongo'>
                PayMongo (Visa, Mastercard, GCash, Maya, BPI, UBP)
              </Radio>
              <Radio value='Dragonpay'>
                Dragonpay (Bayad Center, M Lhuilier, OTC)
              </Radio>
            </Radio.Group>
          </Form.Item>
        </div>
      )}
      <div>
        {isBookingRequestFlow && (
          <Button type='primary' onClick={onClickRequestBooking}>
            Request Booking
          </Button>
        )}

        {!isBookingRequestFlow && (
          <Button type='primary' onClick={onClickPay}>
            {payButtonAction} ₱{tentativeBooking?.totalPrice}
          </Button>
        )}
        <Button onClick={() => onPreviousStep && onPreviousStep()}>
          Book Again
        </Button>
      </div>
    </div>
  );
}
