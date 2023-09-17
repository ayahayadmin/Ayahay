import {
  Button,
  DatePicker,
  Divider,
  Form,
  Input,
  Select,
  Typography,
} from 'antd';
import React, { useState } from 'react';
import { CIVIL_STATUS, OCCUPATION, SEX } from '@ayahay/constants/enum';
import {
  IPassenger,
  IVehicle,
  mockFather,
  mockVehicleTypes,
} from '@ayahay/models';
import EnumRadio from '@/components/form/EnumRadio';
import AddCompanionsModal from '@/components/booking/AddCompanionsModal';
import EnumSelect from '@/components/form/EnumSelect';
import AddVehiclesModal from '@/components/booking/AddVehiclesModal';
import { toPassengerFormValue } from '@ayahay/services/form.service';

const { Title } = Typography;

interface PassengerInformationFormProps {
  onNextStep?: () => void;
  onPreviousStep?: () => void;
}

const yearToday = new Date().getFullYear();

export default function PassengerInformationForm({
  onNextStep,
  onPreviousStep,
}: PassengerInformationFormProps) {
  const form = Form.useFormInstance();
  const passengers = Form.useWatch('passengers', form);
  const vehicles = Form.useWatch('vehicles', form);
  const [loggedInPassenger, setLoggedInPassenger] = useState<IPassenger>();
  const [companionModalOpen, setCompanionModalOpen] = useState(false);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);

  const addPassengers = (companions: IPassenger[]) => {
    setCompanionModalOpen(false);
    let nextIndex = passengers.length;
    companions.forEach((companion) => {
      form.setFieldValue(
        ['passengers', nextIndex],
        toPassengerFormValue(companion)
      );
      nextIndex++;
    });
  };

  const addVehicles = (registeredVehicles: IVehicle[]) => {
    setVehicleModalOpen(false);
    let nextIndex = vehicles.length;
    registeredVehicles.forEach((vehicle) => {
      form.setFieldValue(['vehicles', nextIndex], vehicle);
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
    form.setFieldValue(['passengers', 0], toPassengerFormValue(mockFather));
  };

  return (
    <>
      <Title level={2}>Passenger Information</Title>
      <Button
        type='link'
        onClick={() => onLogin()}
        style={{ whiteSpace: 'normal' }}
      >
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
                <Button onClick={() => remove(name)}>Remove Passenger</Button>
              </div>
            ))}

            <Button type='dashed' onClick={() => add({})} block>
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
      <Form.List name='vehicles'>
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }, index) => (
              <div key={key}>
                <Divider>Vehicle {index + 1} Information</Divider>
                <Form.Item
                  {...restField}
                  name={[name, 'plateNo']}
                  label='Plate Number'
                  colon={false}
                  rules={[{ required: true, message: 'Missing plate number' }]}
                >
                  <Input
                    disabled={vehicles?.[index]?.id !== undefined}
                    placeholder='Plate Number'
                  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'modelName']}
                  label='Model Name'
                  colon={false}
                  rules={[{ required: true, message: 'Missing model name' }]}
                >
                  <Input
                    disabled={vehicles?.[index]?.id !== undefined}
                    placeholder='Toyota Innova, Lexus GX'
                  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'modelYear']}
                  label='Model Year Manufactured'
                  colon={false}
                  rules={[
                    {
                      required: true,
                      message: 'Missing model year manufactured',
                    },
                  ]}
                >
                  <Select
                    disabled={vehicles?.[index]?.id !== undefined}
                    placeholder='Select an option...'
                    options={Array.from(
                      { length: 50 },
                      (_, i) => yearToday - i
                    ).map((year) => ({
                      value: year,
                      label: year,
                    }))}
                  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'vehicleTypeId']}
                  label='Model Body'
                  colon={false}
                  rules={[
                    {
                      required: true,
                      message: 'Missing model body',
                    },
                  ]}
                >
                  <Select
                    disabled={vehicles?.[index]?.id !== undefined}
                    placeholder='Select an option...'
                    options={mockVehicleTypes.map((vehicleType) => ({
                      label: vehicleType.name,
                      value: vehicleType.id,
                    }))}
                  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'certificateOfRegistrationUrl']}
                  hidden={true}
                >
                  <Input
                    disabled={vehicles?.[index]?.id !== undefined}
                    placeholder='Certificate of Registration'
                  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'officialReceiptUrl']}
                  hidden={true}
                >
                  <Input
                    disabled={vehicles?.[index]?.id !== undefined}
                    placeholder='Official Receipt URL'
                  />
                </Form.Item>
                <Button onClick={() => remove(name)}>Remove Vehicle</Button>
              </div>
            ))}

            <Button type='dashed' onClick={() => add()} block>
              Add Vehicle
            </Button>
            {loggedInPassenger && (
              <Button
                type='dashed'
                onClick={() => setVehicleModalOpen(true)}
                block
              >
                Add Registered Vehicle
              </Button>
            )}
            {loggedInPassenger && (
              <AddVehiclesModal
                open={vehicleModalOpen}
                loggedInPassenger={loggedInPassenger}
                onSubmitVehicles={addVehicles}
                onCancel={() => setVehicleModalOpen(false)}
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
