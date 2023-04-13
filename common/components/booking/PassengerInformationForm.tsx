import { Button, DatePicker, Divider, Form, Input, Radio } from 'antd';
import React, { useState } from 'react';
import { CIVIL_STATUS, SEX } from '@/common/constants/enum';
import EnumRadio from '@/common/components/form/EnumRadio';
import { DEFAULT_PASSENGER } from '@/common/constants/default';
import Passenger, { toFormValue } from '@/common/models/passenger';
import AddCompanionsModal from '@/common/components/booking/AddCompanionsModal';

interface PassengerInformationFormProps {
  loggedInPassenger?: Passenger;
  onNextStep?: () => void;
  onPreviousStep?: () => void;
}

export default function PassengerInformationForm({
  loggedInPassenger,
  onNextStep,
  onPreviousStep,
}: PassengerInformationFormProps) {
  const form = Form.useFormInstance();
  const passengers = Form.useWatch('passengers', form);
  const [companionModalOpen, setCompanionModalOpen] = useState(false);

  const addPassengers = (companions: Passenger[]) => {
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

  return (
    <>
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
                <Form.Item
                  {...restField}
                  name={[name, 'occupation']}
                  label='Occupation'
                  colon={false}
                  rules={[{ required: true, message: 'Missing occupation' }]}
                >
                  <Input
                    disabled={passengers?.[index]?.id !== undefined}
                    placeholder='Doctor, Lawyer, or Failure'
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
                Add Recent Companions
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
