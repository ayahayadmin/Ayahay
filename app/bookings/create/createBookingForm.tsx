import { Button, Form, Steps, Typography } from 'antd';
import Trip from '@/common/models/trip.model';
import PassengerInformationForm from '@/common/components/booking/PassengerInformationForm';
import React, { useState } from 'react';
import PassengerPreferencesForm from '@/common/components/booking/PassengerPreferencesForm';

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
  { title: 'Passenger Preferences', fieldNamesToValidate: [''] },
  { title: 'Passenger Vehicles', fieldNamesToValidate: [''] },
];

export default function CreateBookingForm({ trip }: CreateBookingFormProps) {
  const [form] = Form.useForm();
  const passengers = Form.useWatch('passengers', form);

  const [currentStep, setCurrentStep] = useState(0);

  const onClickNext = async () => {
    try {
      if (passengers === undefined) {
        return;
      }
      const fieldNames = steps[currentStep].fieldNamesToValidate;
      const namePaths: (string | number)[][] = [];
      passengers.forEach((_: any, index: any) => {
        fieldNames.forEach((fieldName) =>
          namePaths.push(['passengers', index, fieldName])
        );
      });
      console.log(namePaths);
      const values = await form.validateFields(namePaths);
      console.log(values);
      nextStep();
    } catch (e) {
      console.error(e);
    }
  };

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const previousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const items = steps.map(({ title }) => ({ key: title, title: title }));

  return (
    <Form
      form={form}
      initialValues={{
        passengers: [{}],
      }}
      onValuesChange={(changesValues, values) => console.log(values)}
      onFinish={(values) => console.log(values)}
    >
      <Steps current={currentStep} items={items} />
      <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
        <Title level={2}>Passenger Information</Title>
        <PassengerInformationForm />
      </div>
      <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
        <Title level={2}>Passenger Preferences</Title>
        <PassengerPreferencesForm />
      </div>
      <Form.Item>
        {currentStep < steps.length - 1 && (
          <Button type='primary' onClick={() => onClickNext()}>
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
