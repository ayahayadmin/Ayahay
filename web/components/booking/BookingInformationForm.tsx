import {
  Button,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Typography,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { DISCOUNT_TYPE, SEX } from '@ayahay/constants/enum';
import { IPassenger, ITrip, IVehicle } from '@ayahay/models';
import EnumRadio from '@ayahay/components/form/EnumRadio';
import AddCompanionsModal from '@/components/booking/AddCompanionsModal';
import AddVehiclesModal from '@/components/booking/AddVehiclesModal';
import {
  getInitialPassengerFormValue,
  getInitialVehicleFormValue,
  toPassengerFormValue,
} from '@ayahay/services/form.service';
import { useAuth } from '@/contexts/AuthContext';
import { DATE_FORMAT_LIST, DATE_PLACEHOLDER } from '@ayahay/constants';
import dayjs from 'dayjs';
import { RangePickerProps } from 'antd/es/date-picker';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface BookingInformationFormProps {
  trip: ITrip;
  onNextStep?: () => void;
  onPreviousStep?: () => void;
}

export default function BookingInformationForm({
  trip,
  onNextStep,
  onPreviousStep,
}: BookingInformationFormProps) {
  const { loggedInAccount, hasPrivilegedAccess } = useAuth();
  const form = Form.useFormInstance();
  const passengers = Form.useWatch(
    ['bookingTrips', 0, 'bookingTripPassengers'],
    form
  );
  const vehicles = Form.useWatch(
    ['bookingTrips', 0, 'bookingTripVehicles'],
    form
  );
  const [companionModalOpen, setCompanionModalOpen] = useState(false);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [newEntityId, setNewEntityId] = useState(-1);
  const vehicleRates = trip?.rateTable?.rows?.filter((row) => row.vehicleType);
  const canBookVehicles = vehicleRates?.length;

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

  const tripNamePath = ['bookingTrips', 0];

  const insertPassengerAtFirstIndex = (passenger?: IPassenger) => {
    if (passenger === undefined || passengers === undefined) {
      return;
    }

    if (passengers.length === 1 && passengers[0].firstName === undefined) {
      form.setFieldValue(
        [...tripNamePath, 'bookingTripPassengers', 0],
        toPassengerFormValue(trip.id, passenger)
      );
      return;
    }

    const newPassengerOrder = [passenger];

    for (const currentPassenger of passengers) {
      newPassengerOrder.push(currentPassenger);
    }

    form.resetFields();

    for (let i = 0; i < newPassengerOrder.length; i++) {
      form.setFieldValue(
        [...tripNamePath, 'bookingTripPassengers', i],
        toPassengerFormValue(trip.id, newPassengerOrder[i])
      );
    }
  };

  const removeAllCompanions = () => {
    if (passengers === undefined || passengers.length === 0) {
      return;
    }

    const nonCompanions = [];

    for (const passenger of passengers) {
      if (passenger.id <= 0) {
        nonCompanions.push(passenger);
      }
    }

    form.resetFields();

    for (let i = 0; i < nonCompanions.length; i++) {
      form.setFieldValue(
        [...tripNamePath, 'bookingTripPassengers', i, 'passenger'],
        nonCompanions[i]
      );
    }
  };

  const removeAllRegisteredVehicles = () => {
    if (vehicles === undefined || vehicles.length === 0) {
      return;
    }

    const nonRegisteredVehicles = [];

    for (const vehicle of vehicles) {
      if (vehicle.id <= 0) {
        nonRegisteredVehicles.push(vehicle);
      }
    }

    form.resetFields();

    for (let i = 0; i < nonRegisteredVehicles.length; i++) {
      form.setFieldValue(
        [...tripNamePath, 'bookingTripVehicles', i, 'vehicle'],
        nonRegisteredVehicles[i]
      );
    }
  };

  const addCompanions = (companions: IPassenger[]) => {
    setCompanionModalOpen(false);
    let nextIndex = passengers.length;
    companions.forEach((companion) => {
      form.setFieldValue(
        [...tripNamePath, 'bookingTripPassengers', nextIndex],
        toPassengerFormValue(trip.id, companion)
      );
      nextIndex++;
    });
  };

  const addRegisteredVehicles = (registeredVehicles: IVehicle[]) => {
    setVehicleModalOpen(false);
    let nextIndex = vehicles.length;
    registeredVehicles.forEach((vehicle) => {
      form.setFieldValue([...tripNamePath, 'bookingTripVehicles', nextIndex], {
        tripId: trip.id,
        vehicleId: vehicle.id,
        vehicle,
      });
      nextIndex++;
    });
  };

  const addNewPassenger = (addFn: any) => {
    const newPassenger = getInitialPassengerFormValue(trip.id, newEntityId);
    addFn(newPassenger);
    setNewEntityId(newEntityId - 1);
  };

  const addNewVehicle = (addFn: any) => {
    const newVehicle = getInitialVehicleFormValue(trip.id, newEntityId);
    addFn(newVehicle);
    setNewEntityId(newEntityId - 1);
  };

  const validateFieldsInCurrentStep = async () => {
    if (passengers === undefined || vehicles === undefined) {
      return;
    }
    try {
      const namePaths: (string | number)[][] = [
        [...tripNamePath, 'bookingTripPassengers'],
        [...tripNamePath, 'bookingTripVehicles'],
        ['voucherCode'],
      ];

      await form.validateFields(namePaths, { recursive: true });

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
      <Title level={2}>Booking Information</Title>
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
        name={['bookingTrips', 0, 'bookingTripPassengers']}
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
                  name={[name, 'passenger', 'firstName']}
                  label='First Name'
                  colon={false}
                  rules={[{ required: true, message: 'Missing first name' }]}
                >
                  <Input
                    disabled={passengers?.[index]?.passenger?.id > 0}
                    placeholder='First Name'
                  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'passenger', 'lastName']}
                  label='Last Name'
                  colon={false}
                  rules={[{ required: true, message: 'Missing last name' }]}
                >
                  <Input
                    disabled={passengers?.[index]?.passenger?.id > 0}
                    placeholder='Last Name'
                  />
                </Form.Item>
                <EnumRadio
                  _enum={SEX}
                  disabled={passengers?.[index]?.passenger?.id > 0}
                  {...restField}
                  name={[name, 'passenger', 'sex']}
                  label='Sex'
                  colon={false}
                  rules={[{ required: true, message: 'Missing sex' }]}
                />
                <Form.Item
                  {...restField}
                  name={[name, 'passenger', 'birthdayIso']}
                  label='Date of Birth'
                  colon={false}
                  rules={[{ required: true, message: 'Missing Date of Birth' }]}
                >
                  <DatePicker
                    disabled={passengers?.[index]?.passenger?.id > 0}
                    format={DATE_FORMAT_LIST}
                    placeholder={DATE_PLACEHOLDER}
                    style={{ minWidth: '20%' }}
                    disabledDate={disabledDate}
                  />
                </Form.Item>
                {hasPrivilegedAccess && (
                  <Form.Item
                    {...restField}
                    name={[name, 'passenger', 'age']}
                    label='Age'
                    colon={false}
                  >
                    <InputNumber
                      disabled={passengers?.[index]?.passenger?.id > 0}
                      min={0}
                      placeholder='Age'
                    />
                  </Form.Item>
                )}
                <Form.Item
                  {...restField}
                  name={[name, 'passenger', 'address']}
                  label='Address'
                  colon={false}
                  rules={[{ required: true, message: 'Missing address' }]}
                >
                  <Input
                    disabled={passengers?.[index]?.passenger?.id > 0}
                    placeholder='Region, Province, Municipality'
                  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'passenger', 'nationality']}
                  label='Nationality'
                  colon={false}
                  rules={[{ required: true, message: 'Missing nationality' }]}
                >
                  <Input
                    disabled={passengers?.[index]?.passenger?.id > 0}
                    placeholder='Filipino, Chinese, American, etc.'
                  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'preferredCabinId']}
                  label='Accommodation'
                  colon={false}
                >
                  <Radio.Group>
                    <Radio value={undefined}>Any</Radio>
                    {trip?.availableCabins?.map(({ cabin }) => (
                      <Radio value={cabin?.id} key={cabin?.id}>
                        {cabin?.cabinType?.name}
                      </Radio>
                    ))}
                  </Radio.Group>
                </Form.Item>
                {hasPrivilegedAccess && (
                  <EnumRadio
                    _enum={DISCOUNT_TYPE}
                    nullChoiceLabel={'Adult'}
                    {...restField}
                    name={[name, 'passenger', 'discountType']}
                    label='Discount Type'
                    colon={false}
                  />
                )}
                {!hasPrivilegedAccess && vehicles?.length > 0 && (
                  <Form.Item
                    {...restField}
                    name={[name, 'drivesVehicleId']}
                    label='Driver of Vehicle'
                    colon={false}
                    rules={[
                      ({ getFieldValue }) => ({
                        async validator(_, value) {
                          const passengerId = getFieldValue([
                            'bookingTrips',
                            0,
                            'bookingTripPassengers',
                            name,
                            'passenger',
                            'id',
                          ]);
                          const drivesSameVehicle = passengers.find(
                            ({ drivesVehicleId, passenger }) =>
                              value &&
                              drivesVehicleId === value &&
                              passenger.id !== passengerId
                          );
                          const allVehiclesDriven = vehicles.every(
                            ({ vehicleId }) =>
                              passengers.some(
                                ({ drivesVehicleId }) =>
                                  drivesVehicleId === vehicleId
                              )
                          );
                          if (drivesSameVehicle) {
                            return Promise.reject(
                              'A vehicle can only be driven by one passenger.'
                            );
                          }
                          if (!value && !allVehiclesDriven) {
                            return Promise.reject('Please select a vehicle.');
                          }
                        },
                      }),
                    ]}
                  >
                    <Radio.Group>
                      <Radio value={undefined}>None</Radio>
                      {vehicles.map(({ vehicle }) => (
                        <Radio value={vehicle.id} key={vehicle.id}>
                          {vehicle.plateNo}
                        </Radio>
                      ))}
                    </Radio.Group>
                  </Form.Item>
                )}
                {(hasPrivilegedAccess || index !== 0) && (
                  <Button
                    danger
                    style={{ float: 'right' }}
                    onClick={() => remove(name)}
                  >
                    Remove Passenger
                  </Button>
                )}
              </div>
            ))}

            {passengers?.length === 0 && vehicles?.length === 0 && (
              <p>
                <Text type='danger'>
                  At least one passenger or vehicle is required.
                </Text>
              </p>
            )}

            <Button type='dashed' onClick={() => addNewPassenger(add)} block>
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
                  onSubmitCompanions={addCompanions}
                  onCancel={() => setCompanionModalOpen(false)}
                />
              )}
          </>
        )}
      </Form.List>
      <Form.List
        name={['bookingTrips', 0, 'bookingTripVehicles']}
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
                  name={[name, 'vehicle', 'plateNo']}
                  label='Plate Number'
                  colon={false}
                  rules={[{ required: true, message: 'Missing plate number' }]}
                >
                  <Input
                    disabled={vehicles?.[index]?.vehicle?.id > 0}
                    placeholder='Plate Number'
                  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'vehicle', 'modelName']}
                  label='Model Name'
                  colon={false}
                  rules={[{ required: true, message: 'Missing model name' }]}
                >
                  <Input
                    disabled={vehicles?.[index]?.vehicle?.id > 0}
                    placeholder='Toyota Innova, Lexus GX'
                  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'vehicle', 'vehicleTypeId']}
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
                    disabled={vehicles?.[index]?.vehicle?.id > 0}
                    placeholder='Select an option...'
                    options={vehicleRates
                      ?.filter(
                        (rate) => hasPrivilegedAccess || rate.canBookOnline
                      )
                      ?.map(({ vehicleType, fare }) => ({
                        label: `${vehicleType?.name} · P${fare}`,
                        value: vehicleType?.id,
                      }))}
                  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'vehicle', 'certificateOfRegistrationUrl']}
                  hidden={true}
                >
                  <Input
                    disabled={vehicles?.[index]?.vehicle?.id > 0}
                    placeholder='Certificate of Registration'
                  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'vehicle', 'officialReceiptUrl']}
                  hidden={true}
                >
                  <Input
                    disabled={vehicles?.[index]?.vehicle?.id > 0}
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

            {canBookVehicles && (
              <Button type='dashed' onClick={() => addNewVehicle(add)} block>
                Add Vehicle/Cargo
              </Button>
            )}
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
                  onSubmitVehicles={addRegisteredVehicles}
                  onCancel={() => setVehicleModalOpen(false)}
                />
              )}
          </>
        )}
      </Form.List>
      <div style={{ marginTop: '24px' }}>
        {!loggedInAccount && (
          <div>
            <Divider>Contact Information</Divider>
            <Form.Item
              name='contactEmail'
              label='Email Address'
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
        <Divider>Other Information</Divider>

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
                    >
                      {`
                        ${passenger?.firstName ?? ''} 
                        ${passenger?.lastName ?? ''}
                      `}
                    </Radio>
                  ))}
                </Radio.Group>
              )}
              {passengers.length === 0 && (
                <Input type='text' style={{ width: 256 }} />
              )}
            </Form.Item>
          </div>
        )}
        {hasPrivilegedAccess && (
          <Form.Item name='voucherCode' label='Special Voucher' colon={false}>
            <Radio.Group>
              <Radio value=''>None</Radio>
              <Radio value='COLLECT_BOOKING'>Collect Voucher</Radio>
            </Radio.Group>
          </Form.Item>
        )}

        <Form.Item label='Voucher Code' name='voucherCode' colon={false}>
          <Input />
        </Form.Item>

        {hasPrivilegedAccess && (
          <div>
            <Form.Item name='remarks' label='Remarks' colon={false}>
              <TextArea rows={3} />
            </Form.Item>
          </div>
        )}

        <Button type='primary' onClick={() => validateFieldsInCurrentStep()}>
          Next
        </Button>
      </div>
    </>
  );
}
