import { Button, Form, Steps, Typography } from 'antd';
import Trip from '@/common/models/trip.model';
import PassengerInformationForm from '@/common/components/booking/PassengerInformationForm';
import React, { useState } from 'react';
import PassengerPreferencesForm from '@/common/components/booking/PassengerPreferencesForm';
import { DEFAULT_PASSENGER } from '@/common/constants/default';
import PassengersSummary from '@/common/components/booking/PassengersSummary';
import Passenger, { mockFather } from '@/common/models/passenger';

const { Title } = Typography;

interface CreateBookingFormProps {
  trip?: Trip;
}

const steps = [
  {
    title: 'Passenger Information',
    fieldNamesToValidate: [
      'firstName',
      'lastName',
      'occupation',
      'sex',
      'civilStatus',
      'birthday',
      'address',
      'nationality',
    ],
  },
  { title: 'Passenger Preferences', fieldNamesToValidate: [] },
  { title: 'Confirm Passengers', fieldNamesToValidate: [] },
];

export default function CreateBookingForm({ trip }: CreateBookingFormProps) {
  const [form] = Form.useForm();
  const passengers = Form.useWatch('passengers', form);
  const [loggedInPassenger, setLoggedInPassenger] = useState<Passenger>();

  const [currentStep, setCurrentStep] = useState(0);

  const validateFieldsInCurrentStep = async () => {
    try {
      const passengerList: any[] = passengers ?? [];
      const fieldNames = steps[currentStep].fieldNamesToValidate;
      const namePaths: (string | number)[][] = [];
      passengerList.forEach((_, index) => {
        fieldNames.forEach((fieldName) =>
          namePaths.push(['passengers', index, fieldName])
        );
      });
      await form.validateFields(namePaths);
      nextStep();
    } catch (formErrors) {
      console.error(formErrors);
    }
  };

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const previousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const onLogin = () => {
    setLoggedInPassenger(mockFather);
    form.setFieldValue(['passengers', 0], mockFather);
  };

  const items = steps.map(({ title }) => ({ key: title, title: title }));

  return (
    <Form
      form={form}
      initialValues={{
        passengers: [DEFAULT_PASSENGER],
      }}
      onValuesChange={(changesValues, values) => console.log(values)}
      onFinish={(values) => console.log(values)}
    >
      <Steps current={currentStep} items={items} />
      <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
        <Title level={2}>Passenger Information</Title>
        <Button type='link' onClick={() => onLogin()}>
          Have an account? Log in to book faster.
        </Button>
        <PassengerInformationForm loggedInPassenger={loggedInPassenger} />
      </div>
      <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
        <Title level={2}>Passenger Preferences</Title>
        <PassengerPreferencesForm trip={trip} />
      </div>
      <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
        <Title level={2}>Confirm Passengers</Title>
        <PassengersSummary passengers={passengers} />
      </div>
      <Form.Item>
        {currentStep < steps.length - 1 && (
          <Button type='primary' onClick={() => validateFieldsInCurrentStep()}>
            Next
          </Button>
        )}
        {currentStep === steps.length - 1 && (
          <Button type='primary' htmlType='submit'>
            Done
          </Button>
        )}
        {currentStep > 0 && (
          <Button style={{ margin: '0 8px' }} onClick={() => previousStep()}>
            Previous
          </Button>
        )}
      </Form.Item>
    </Form>
  );
}
