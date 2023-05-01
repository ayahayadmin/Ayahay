import {
  Button,
  DatePicker,
  Divider,
  Form,
  Input,
  Typography,
} from 'antd';
import React, { useState } from 'react';
import { CIVIL_STATUS, OCCUPATION, SEX } from '@ayahay/constants/enum';
import { DEFAULT_PASSENGER } from '@ayahay/constants/default';
import {
  IPassenger,
  mockFather,
  toFormValue,
} from '@ayahay/models/passenger.model';
import EnumRadio from '@/components/form/EnumRadio';
import AddCompanionsModal from '@/components/booking/AddCompanionsModal';

const { Title } = Typography;

interface PassengerInformationFormProps {
  onNextStep?: () => void;
  onPreviousStep?: () => void;
}

export default function PassengerInformationForm({
  onNextStep,
  onPreviousStep,
}: PassengerInformationFormProps) {
  const form = Form.useFormInstance();
  const passengers = Form.useWatch('passengers', form);
  const [loggedInPassenger, setLoggedInPassenger] = useState<IPassenger>();
  const [companionModalOpen, setCompanionModalOpen] = useState(false);

  const addPassengers = (companions: IPassenger[]) => {
    setCompanionModalOpen(false);
    let nextIndex = passengers.length;
    companions.forEach((companion) => {
      form.setFieldValue(['passengers', nextIndex], toFormValue(companion));
      nextIndex++;
    });
  };

  const validateFieldsInCurrentStep = async () => {
    const fieldNamesToValidate = [
      'firstName',
      'lastName',
      'occupation',
      'sex',
      'civilStatus',
      'birthdayIso',
      'address',
      'nationality',
    ];

    try {
      const passengerList: any[] = passengers ?? [];
      const fieldNames = fieldNamesToValidate;
      const namePaths: (string | number)[][] = [];
      passengerList.forEach((_, index) => {
        fieldNames.forEach((fieldName) =>
          namePaths.push(['passengers', index, fieldName])
        );
      });
      await form.validateFields(namePaths);

      if (onNextStep) {
        onNextStep();
      }
    } catch (formErrors) {
      console.error(formErrors);
    }
  };

  const onLogin = () => {
    setLoggedInPassenger(mockFather);
    form.setFieldValue(['passengers', 0], toFormValue(mockFather));
  };

  return (
    <>
      <Title level={2}>Passenger Information</Title>
      <Button type='link' onClick={() => onLogin()}>
        Have an account? Log in to book faster.
      </Button>
      <Form.List name='passengers'>
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }, index) => (
              <div key={key}>
                {index === 0 && <Divider>Your Information</Divider>}
                {index > 0 && <Divider>Companion {index} Information</Divider>}
                <Form.Item
                  {...restField}
                  name={[name, 'firstName']}
                  label='First Name'
                  colon={false}
                  rules={[{ required: true, message: 'Missing first name' }]}
                >
                  <Input
                    disabled={passengers?.[index]?.id !== undefined}
                    placeholder='First Name'
                  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'lastName']}
                  label='Last Name'
                  colon={false}
                  rules={[{ required: true, message: 'Missing last name' }]}
                >
                  <Input
                    disabled={passengers?.[index]?.id !== undefined}
                    placeholder='Last Name'
                  />
                </Form.Item>
                <EnumRadio
                  _enum={SEX}
                  disabled={passengers?.[index]?.id !== undefined}
                  {...restField}
                  name={[name, 'sex']}
                  label='Sex'
                  colon={false}
                  rules={[{ required: true, message: 'Missing sex' }]}
                />
                <EnumRadio
                  _enum={OCCUPATION}
                  disabled={passengers?.[index]?.id !== undefined}
                  {...restField}
                  name={[name, 'occupation']}
                  label='Occupation'
                  colon={false}
                  rules={[{ required: true, message: 'Missing occupation' }]}
                />
                <EnumRadio
                  _enum={CIVIL_STATUS}
                  disabled={passengers?.[index]?.id !== undefined}
                  {...restField}
                  name={[name, 'civilStatus']}
                  label='Civil Status'
                  colon={false}
                  rules={[{ required: true, message: 'Missing civil status' }]}
                />
                <Form.Item
                  {...restField}
                  name={[name, 'birthdayIso']}
                  label='Date of Birth'
                  colon={false}
                  rules={[{ required: true, message: 'Missing date of birth' }]}
                >
                  <DatePicker
                    disabled={passengers?.[index]?.id !== undefined}
                    format='YYYY/MM/DD'
                    placeholder='YYYY/MM/DD'
                  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'address']}
                  label='Address'
                  colon={false}
                  rules={[{ required: true, message: 'Missing address' }]}
                >
                  <Input
                    disabled={passengers?.[index]?.id !== undefined}
                    placeholder='Region, Province, Municipality'
                  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'nationality']}
                  label='Nationality'
                  colon={false}
                  rules={[{ required: true, message: 'Missing nationality' }]}
                >
                  <Input
                    disabled={passengers?.[index]?.id !== undefined}
                    placeholder='Filipino, Chinese, American, etc.'
                  />
                </Form.Item>
                {index > 0 && (
                  <Button onClick={() => remove(name)}>Remove Passenger</Button>
                )}
              </div>
            ))}

            <Button type='dashed' onClick={() => add(DEFAULT_PASSENGER)} block>
              Add Companion
            </Button>
            {loggedInPassenger && (
              <Button
                type='dashed'
                onClick={() => setCompanionModalOpen(true)}
                block
              >
                Add Travel Buddies
              </Button>
            )}
            {loggedInPassenger && (
              <AddCompanionsModal
                open={companionModalOpen}
                loggedInPassenger={loggedInPassenger}
                onSubmitCompanions={addPassengers}
                onCancel={() => setCompanionModalOpen(false)}
              />
            )}
          </>
        )}
      </Form.List>
      <div>
        <Button type='primary' onClick={() => validateFieldsInCurrentStep()}>
          Next
        </Button>
      </div>
    </>
  );
}
