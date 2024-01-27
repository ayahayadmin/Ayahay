import {
  Button,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Select,
  Typography,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { DISCOUNT_TYPE, SEX } from '@ayahay/constants/enum';
import { IPassenger, IVehicle, IVehicleType } from '@ayahay/models';
import EnumRadio from '@/components/form/EnumRadio';
import AddCompanionsModal from '@/components/booking/AddCompanionsModal';
import AddVehiclesModal from '@/components/booking/AddVehiclesModal';
import { toPassengerFormValue } from '@ayahay/services/form.service';
import { useAuth } from '@/app/contexts/AuthContext';
import { DATE_FORMAT_LIST, DATE_PLACEHOLDER } from '@ayahay/constants';
import { computeAge, computeBirthday } from '@ayahay/services/date.service';
import dayjs from 'dayjs';
import { RangePickerProps } from 'antd/es/date-picker';

const { Text, Title } = Typography;

interface PassengerInformationFormProps {
  availableVehicleTypes: IVehicleType[];
  onNextStep?: () => void;
  onPreviousStep?: () => void;
}

const passengerFieldsToValidate = [
  'firstName',
  'lastName',
  'sex',
  'birthdayIso',
  'age',
  'address',
  'nationality',
  'discountType',
];

const vehicleFieldsToValidate = ['plateNo', 'modelName', 'vehicleTypeId'];

export default function PassengerInformationForm({
  availableVehicleTypes,
  onNextStep,
  onPreviousStep,
}: PassengerInformationFormProps) {
  const { loggedInAccount, hasPrivilegedAccess } = useAuth();

  const form = Form.useFormInstance();
  const passengers = Form.useWatch<any[]>('passengers', form);
  const vehicles = Form.useWatch<any[]>('vehicles', form);
  const [companionModalOpen, setCompanionModalOpen] = useState(false);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);

  useEffect(() => {
    if (loggedInAccount === null) {
      return;
    }

    if (loggedInAccount) {
      insertPassengerAtFirstIndex(loggedInAccount.passenger);
    } else {
      removeAllCompanions();
      removeAllRegisteredVehicles();
    }
  }, [loggedInAccount]);

  const insertPassengerAtFirstIndex = (passenger?: IPassenger) => {
    if (passenger === undefined) {
      return;
    }

    if (passengers.length === 1 && passengers[0].firstName === undefined) {
      form.setFieldValue(['passengers', 0], toPassengerFormValue(passenger));
      return;
    }

    const newPassengerOrder = [passenger];

    for (const currentPassenger of passengers) {
      newPassengerOrder.push(currentPassenger);
    }

    form.resetFields();

    for (let i = 0; i < newPassengerOrder.length; i++) {
      form.setFieldValue(
        ['passengers', i],
        toPassengerFormValue(newPassengerOrder[i])
      );
    }
  };

  const removeAllCompanions = () => {
    if (passengers === undefined || passengers.length === 0) {
      return;
    }

    const nonCompanions = [];

    for (const passenger of passengers) {
      if (passenger.id === undefined) {
        nonCompanions.push(passenger);
      }
    }

    form.resetFields();

    for (let i = 0; i < nonCompanions.length; i++) {
      form.setFieldValue(['passengers', i], nonCompanions[i]);
    }
  };

  const removeAllRegisteredVehicles = () => {
    if (vehicles === undefined || vehicles.length === 0) {
      return;
    }

    const nonRegisteredVehicles = [];

    for (const vehicle of vehicles) {
      if (vehicle.id === undefined) {
        nonRegisteredVehicles.push(vehicle);
      }
    }

    form.resetFields();

    for (let i = 0; i < nonRegisteredVehicles.length; i++) {
      form.setFieldValue(['vehicles', i], nonRegisteredVehicles[i]);
    }
  };

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
    if (passengers === undefined || vehicles === undefined) {
      return;
    }
    try {
      const namePaths: (string | number)[][] = [['passengers'], ['vehicles']];
      passengers.forEach((_, index) => {
        passengerFieldsToValidate.forEach((fieldName) =>
          namePaths.push(['passengers', index, fieldName])
        );
      });
      vehicles.forEach((_, index) => {
        vehicleFieldsToValidate.forEach((fieldName) =>
          namePaths.push(['vehicles', index, fieldName])
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

  const openLoginModal = () => {
    const accountBtn: HTMLButtonElement | null =
      document.querySelector('#account-btn');
    accountBtn?.click();
  };

  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    return current > dayjs().endOf('day');
  };

  const atLeastOnePassengerOrVehicleValidator = (
    _: any,
    __: any
  ): Promise<void> => {
    if (passengers === undefined || vehicles === undefined) {
      return Promise.reject();
    }

    if (passengers.length === 0 && vehicles.length === 0) {
      return Promise.reject();
    }

    return Promise.resolve();
  };

  return (
    <>
      <Title level={2}>Passenger Information</Title>
      {loggedInAccount === undefined && (
        <Button
          type='link'
          onClick={() => openLoginModal()}
          style={{ whiteSpace: 'normal' }}
        >
          Have an account? Log in to book faster.
        </Button>
      )}
      <Form.List
        name='passengers'
        rules={[
          {
            message: 'Please add a passenger',
            validator: atLeastOnePassengerOrVehicleValidator,
          },
        ]}
      >
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
                <Form.Item
                  {...restField}
                  name={[name, 'birthdayIso']}
                  label='Date of Birth'
                  colon={false}
                  rules={[
                    { required: true, message: 'Missing Date of Birth' },
                    ({ setFields, setFieldValue }) => ({
                      async validator(_, value) {
                        if (value) {
                          const age = computeAge(value);
                          setFieldValue(['passengers', name, 'age'], age);
                          setFields([
                            { name: ['passengers', name, 'age'], errors: [] },
                          ]);

                          if (!hasPrivilegedAccess) {
                            return;
                          }

                          const discountType = getDiscountTypeFromAge(age);
                          setFieldValue(
                            ['passengers', name, 'discountType'],
                            discountType
                          );
                          setFields([
                            {
                              name: ['passengers', name, 'discountType'],
                              errors: [],
                            },
                          ]);
                          return Promise.resolve();
                        }

                        return Promise.reject();
                      },
                    }),
                  ]}
                >
                  <DatePicker
                    disabled={passengers?.[index]?.id !== undefined}
                    format={DATE_FORMAT_LIST}
                    placeholder={DATE_PLACEHOLDER}
                    style={{ minWidth: '20%' }}
                    disabledDate={disabledDate}
                  />
                </Form.Item>
                {hasPrivilegedAccess && (
                  <Form.Item
                    {...restField}
                    name={[name, 'age']}
                    label='Age'
                    colon={false}
                    rules={[
                      ({ getFieldValue, setFields, setFieldValue }) => ({
                        validator(_, value) {
                          if (value !== undefined) {
                            const discountType = getDiscountTypeFromAge(value);
                            const inputtedBirthday = getFieldValue([
                              'passengers',
                              name,
                              'birthdayIso',
                            ]);
                            const birthday = computeBirthday(
                              value,
                              inputtedBirthday
                            );
                            setFieldValue(
                              ['passengers', name, 'birthdayIso'],
                              dayjs(birthday)
                            );
                            setFieldValue(
                              ['passengers', name, 'discountType'],
                              discountType
                            );

                            setFields([
                              {
                                name: ['passengers', name, 'birthdayIso'],
                                errors: [],
                              },
                              {
                                name: ['passengers', name, 'discountType'],
                                errors: [],
                              },
                            ]);
                            return Promise.resolve();
                          }

                          return Promise.reject(new Error('Missing age'));
                        },
                      }),
                    ]}
                  >
                    <InputNumber
                      disabled={passengers?.[index]?.id !== undefined}
                      min={0}
                      placeholder='Age'
                    />
                  </Form.Item>
                )}
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
                {hasPrivilegedAccess && (
                  <EnumRadio
                    _enum={DISCOUNT_TYPE}
                    nullChoiceLabel={'Adult'}
                    {...restField}
                    name={[name, 'discountType']}
                    label='Discount Type'
                    colon={false}
                  />
                )}
                <Button
                  danger
                  style={{ float: 'right' }}
                  onClick={() => remove(name)}
                >
                  Remove Passenger
                </Button>
              </div>
            ))}

            {passengers?.length === 0 && vehicles?.length === 0 && (
              <p>
                <Text type='danger'>
                  At least one passenger or vehicle is required.
                </Text>{' '}
              </p>
            )}

            <Button
              type='dashed'
              onClick={() =>
                add({ nationality: 'Filipino', discountType: undefined })
              }
              block
            >
              Add Companion
            </Button>
            {loggedInAccount &&
              loggedInAccount.passenger &&
              loggedInAccount.passenger.companions &&
              loggedInAccount.passenger.companions.length > 0 && (
                <Button
                  type='dashed'
                  onClick={() => setCompanionModalOpen(true)}
                  block
                >
                  Add Travel Buddies
                </Button>
              )}
            {loggedInAccount &&
              loggedInAccount.passenger &&
              loggedInAccount.passenger.companions &&
              loggedInAccount.passenger.companions.length > 0 && (
                <AddCompanionsModal
                  open={companionModalOpen}
                  companions={loggedInAccount.passenger.companions}
                  onSubmitCompanions={addPassengers}
                  onCancel={() => setCompanionModalOpen(false)}
                />
              )}
          </>
        )}
      </Form.List>
      <Form.List
        name='vehicles'
        rules={[
          {
            message: 'Please add a vehicle',
            validator: atLeastOnePassengerOrVehicleValidator,
          },
        ]}
      >
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
                    showSearch
                    optionFilterProp='children'
                    filterOption={(input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                    disabled={vehicles?.[index]?.id !== undefined}
                    placeholder='Select an option...'
                    options={availableVehicleTypes.map((vehicleType) => ({
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
                <Button
                  danger
                  style={{ float: 'right' }}
                  onClick={() => remove(name)}
                >
                  Remove Vehicle
                </Button>
              </div>
            ))}

            <Button type='dashed' onClick={() => add()} block>
              Add Vehicle
            </Button>
            {loggedInAccount &&
              loggedInAccount.vehicles &&
              loggedInAccount.vehicles.length > 0 && (
                <Button
                  type='dashed'
                  onClick={() => setVehicleModalOpen(true)}
                  block
                >
                  Add Registered Vehicle
                </Button>
              )}
            {loggedInAccount &&
              loggedInAccount.vehicles &&
              loggedInAccount.vehicles.length > 0 && (
                <AddVehiclesModal
                  open={vehicleModalOpen}
                  vehicles={loggedInAccount.vehicles}
                  onSubmitVehicles={addVehicles}
                  onCancel={() => setVehicleModalOpen(false)}
                />
              )}
          </>
        )}
      </Form.List>
      <div style={{ marginTop: '24px' }}>
        <Form.Item label='Voucher Code' name='voucherCode' colon={false}>
          <Input />
        </Form.Item>
        <Button type='primary' onClick={() => validateFieldsInCurrentStep()}>
          Next
        </Button>
      </div>
    </>
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
