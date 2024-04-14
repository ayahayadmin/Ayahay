'use client';
import React, { useState } from 'react';
import { IPort, IShip, IShippingLineSchedule } from '@ayahay/models';
import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  notification,
  Popover,
  Table,
  Typography,
} from 'antd';
import { InfoCircleOutlined, StockOutlined } from '@ant-design/icons';
import { CreateTripsFromSchedulesRequest } from '@ayahay/http';
import { ColumnsType } from 'antd/es/table';
import { createTripsFromSchedules } from '@/services/trip.service';
import { TripRatesModal } from '@/components/modal/TripRatesModal';
import { getAxiosError } from '@ayahay/services/error.service';

interface CreateTripsFromScheduleFormProps {
  schedules: IShippingLineSchedule[];
}

const { RangePicker } = DatePicker;
const { Title } = Typography;

// TODO: handle multiple date ranges
const allowMultipleDateRanges = false;
const buttonPadding = { padding: '4px 0' };

const columns: ColumnsType<IShippingLineSchedule> = [
  {
    render: (schedule: IShippingLineSchedule) => (
      <Checkbox value={schedule.id}></Checkbox>
    ),
  },
  {
    title: 'Origin',
    key: 'srcPort',
    dataIndex: 'srcPort',
    render: (port: IPort) => port.name,
  },
  {
    title: 'Destination',
    key: 'destPort',
    dataIndex: 'destPort',
    render: (port: IPort) => port.name,
  },
  {
    title: 'Departure Time',
    key: 'departureTime',
    render: (schedule: IShippingLineSchedule) => {
      const date = new Date();
      date.setHours(schedule.departureHour, schedule.departureMinute, 0, 0);
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    },
  },
  {
    title: 'Vessel',
    key: 'vessel',
    render: (schedule: IShippingLineSchedule) =>
      schedule.ship && (
        <div>
          {schedule.ship.name}
          <Popover
            content={<ScheduleCapacitiesPopover ship={schedule.ship} />}
            trigger='click'
          >
            <InfoCircleOutlined />
          </Popover>
        </div>
      ),
  },
  {
    title: 'Rates',
    key: 'rates',
    render: (schedule: IShippingLineSchedule) => {
      const passengerRates =
        schedule.rates
          ?.filter((rate) => rate.cabinId !== undefined)
          ?.map((rate) => ({
            key: rate.id,
            cabinTypeName: rate.cabin?.cabinType?.name,
            cabinTypeFare: rate.fare,
          })) ?? [];
      const vehicleRates =
        schedule.rates
          ?.filter((rate) => rate.vehicleTypeId !== undefined)
          ?.map((rate) => ({
            key: rate.id,
            vehicleTypeName: rate.vehicleType?.name,
            vehicleTypeFare: rate.fare,
          })) ?? [];
      return (
        schedule.rates && (
          <div>
            <Popover
              content={
                <TripRatesModal
                  passengerRates={passengerRates}
                  vehicleRates={vehicleRates}
                />
              }
              trigger='click'
            >
              <StockOutlined />
            </Popover>
          </div>
        )
      );
    },
  },
];

export default function CreateTripsFromScheduleForm({
  schedules,
}: CreateTripsFromScheduleFormProps) {
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();
  const [isCreatingTrips, setIsCreatingTrips] = useState(false);

  const onSubmitForm = async (formValues: any) => {
    try {
      await form.validateFields();
    } catch {
      return;
    }
    setIsCreatingTrips(true);
    const request: CreateTripsFromSchedulesRequest = {
      schedules: formValues.scheduleIds.map((scheduleId: any) => ({
        scheduleId,
      })),
      dateRanges: formValues.dateRanges.map(({ dateRange }: any) => {
        return {
          startDate: dateRange[0].format('YYYY-MM-DD'),
          endDate: dateRange[1].format('YYYY-MM-DD'),
        };
      }),
    };

    const error = await createTripsFromSchedules(request);
    if (error === undefined) {
      form.resetFields();
      api.success({
        message: 'Create Trips Success',
        description:
          'Trips were successfully created for the selected date range.',
      });
    } else {
      const axiosError = getAxiosError<string>(error);
      const errorMessage =
        axiosError && axiosError.statusCode === 400
          ? axiosError.message
          : 'Something went wrong.';
      api.error({
        message: 'Create Trips Failed',
        description: errorMessage,
      });
    }

    setIsCreatingTrips(false);
  };

  return (
    <Form
      form={form}
      initialValues={{
        scheduleIds: [],
        dateRanges: [{}],
      }}
      onFinish={onSubmitForm}
    >
      <Title level={2}>Select Schedules</Title>
      <Form.Item
        name='scheduleIds'
        rules={[
          {
            required: true,
            message: 'Please select at least one trip from the table',
          },
        ]}
      >
        <Checkbox.Group>
          <Table columns={columns} dataSource={schedules} tableLayout='fixed' />
        </Checkbox.Group>
      </Form.Item>
      <p>
        Can&apos;t find a schedule?&nbsp;
        <Button type='link' href='/upload/trips' style={buttonPadding}>
          Create a trip from a .csv file manually
        </Button>
        &nbsp;or&nbsp;
        <Button
          type='link'
          href={`mailto:it@ayahay.com?subject=Schedule Request`}
          style={buttonPadding}
        >
          contact us for assistance
        </Button>
        .
      </p>

      <Title level={2}>Date Ranges</Title>
      <Form.List name='dateRanges'>
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <div key={key}>
                <Form.Item
                  {...restField}
                  name={[name, 'dateRange']}
                  rules={[{ required: true, message: 'Missing date range' }]}
                  colon={false}
                >
                  <RangePicker />
                </Form.Item>
                {allowMultipleDateRanges && (
                  <Button type='dashed' onClick={() => remove(name)}>
                    Remove Date Range
                  </Button>
                )}
              </div>
            ))}
            {allowMultipleDateRanges && (
              <Button type='dashed' onClick={() => add({})}>
                Add Date Range
              </Button>
            )}
          </>
        )}
      </Form.List>
      <Form.Item>
        <Button type='primary' htmlType='submit' loading={isCreatingTrips}>
          Submit
        </Button>
      </Form.Item>
      {contextHolder}
    </Form>
  );
}

function ScheduleCapacitiesPopover({ ship }: { ship: IShip }) {
  return (
    <article>
      <Title level={2}>Capacities</Title>
      {ship.cabins?.map((cabin) => (
        <div key={cabin.id}>
          {cabin.cabinType?.name} -&nbsp;
          <strong>{cabin.recommendedPassengerCapacity} Adults</strong>
        </div>
      ))}
      <div>
        {ship.name} -&nbsp;
        <strong>{ship.recommendedVehicleCapacity} Vehicles</strong>
      </div>
    </article>
  );
}
