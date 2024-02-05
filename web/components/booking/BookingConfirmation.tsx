import { IBooking } from '@ayahay/models/booking.model';
import React from 'react';
import BookingSummary from '@ayahay/components/descriptions/BookingSummary';
import { Button, Form, Input, notification, Radio, Typography } from 'antd';
import { startPaymentForBooking } from '@/services/payment.service';
import { useAuth } from '@/contexts/AuthContext';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface BookingConfirmationProps {
  tentativeBooking?: IBooking;
  hasPrivilegedAccess: boolean;
  onStartPayment?: (tentativeBookingId: number) => void;
  onPreviousStep?: () => void;
}

export default function BookingConfirmation({
  tentativeBooking,
  hasPrivilegedAccess,
  onPreviousStep,
  onStartPayment,
}: BookingConfirmationProps) {
  const { loggedInAccount } = useAuth();
  const form = Form.useFormInstance();

  const onClickPay = async () => {
    if (tentativeBooking === undefined) {
      return;
    }

    if (loggedInAccount === undefined) {
      try {
        await form.validateFields(['contactEmail']);
      } catch {
        return;
      }
    }

    onStartPayment && onStartPayment(tentativeBooking.id);
  };

  return (
    <div>
      <Title level={2}>Confirm Booking</Title>
      <div style={{ margin: '32px 0' }}>
        {tentativeBooking && (
          <BookingSummary booking={tentativeBooking} titleLevel={3} />
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
        </div>
      )}
      {!hasPrivilegedAccess && (
        <div>
          <Form.Item name='gateway' label='Payment Method' colon={false}>
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
        {tentativeBooking && (
          <Button type='primary' onClick={onClickPay}>
            Pay ₱{tentativeBooking.totalPrice}
          </Button>
        )}
        <Button onClick={() => onPreviousStep && onPreviousStep()}>
          Book Again
        </Button>
      </div>
    </div>
  );
}
