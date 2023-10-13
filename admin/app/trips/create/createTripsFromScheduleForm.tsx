'use client';
import React, { useEffect, useState } from 'react';
import {
  IPort,
  IShip,
  IShippingLine,
  IShippingLineSchedule,
  IShippingLineScheduleRate,
} from '@ayahay/models';
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
import {
  ArrowRightOutlined,
  InfoCircleOutlined,
  StockOutlined,
} from '@ant-design/icons';
import { CreateTripsFromSchedulesRequest } from '@ayahay/http';
import { ColumnsType } from 'antd/es/table';
import { createTripsFromSchedules } from '@/services/trip.service';
import { split } from 'lodash';
import { getTime } from '@/services/search.service';

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
            <InfoCircleOutlined rev={undefined} />
          </Popover>
        </div>
      ),
  },
  {
    title: 'Rates',
    key: 'rates',
    render: (schedule: IShippingLineSchedule) =>
      schedule.rates && (
        <div>
          <Popover
            content={<ScheduleRatesPopover rates={schedule.rates} />}
            trigger='click'
          >
            <StockOutlined rev={undefined} />
          </Popover>
        </div>
      ),
  },
];

export default function CreateTripsFromScheduleForm({
  schedules,
}: CreateTripsFromScheduleFormProps) {
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();
  const [isCreatingTrips, setIsCreatingTrips] = useState(false);

  const onSubmitForm = async (formValues: any) => {
    setIsCreatingTrips(true);
    const request: CreateTripsFromSchedulesRequest = {
      schedules: formValues.scheduleIds.map((scheduleId: any) => ({
        scheduleId,
      })),
      dateRanges: formValues.dateRanges.map(({ dateRange }: any) => ({
        startDateIso: dateRange[0].toISOString(),
        endDateIso: dateRange[1].toISOString(),
      })),
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
      api.error({
        message: 'Create Trips Failed',
        description: 'Something went wrong.',
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
      <Form.Item name='scheduleIds'>
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
            {fields.map(({ key, name, ...restField }, index) => (
              <div key={key}>
                <Form.Item
                  {...restField}
                  name={[name, 'dateRange']}
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

function ScheduleRatesPopover({
  rates,
}: {
  rates: IShippingLineScheduleRate[];
}) {
  const [passengerRates, setPassengerRates] = useState<PassengerRate[]>([]);
  const [vehicleRates, setVehicleRates] = useState<VehicleRate[]>([]);

  useEffect(() => {
    setPassengerRates(
      rates
        .filter((rate) => rate.cabinId !== undefined)
        .map((rate) => ({
          key: rate.id,
          cabinTypeName: rate.cabin?.cabinType?.name,
          cabinTypeFare: rate.fare,
        }))
    );
    setVehicleRates(
      rates
        .filter((rate) => rate.vehicleTypeId !== undefined)
        .map((rate) => ({
          key: rate.id,
          vehicleTypeName: rate.vehicleType?.name,
          vehicleTypeFare: rate.fare,
        }))
    );
  }, [rates]);

  return (
    <article
      style={{ minWidth: '300px', maxHeight: '360px', overflowY: 'auto' }}
    >
      <Title level={2}>Rates</Title>
      <Title level={3}>Passengers</Title>
      <Table columns={passengerRateColumns} dataSource={passengerRates} />
      <Title level={3}>Vehicles</Title>
      <Table columns={vehicleRateColumns} dataSource={vehicleRates} />
    </article>
  );
}

const passengerRateColumns: ColumnsType<PassengerRate> = [
  {
    title: 'Cabin',
    dataIndex: 'cabinTypeName',
    key: 'cabinTypeName',
  },
  {
    title: 'Fare',
    dataIndex: 'cabinTypeFare',
    key: 'cabinTypeFare',
  },
];

const vehicleRateColumns: ColumnsType<VehicleRate> = [
  {
    title: 'Vehicle Type',
    dataIndex: 'vehicleTypeName',
    key: 'vehicleTypeName',
  },
  {
    title: 'Fare',
    dataIndex: 'vehicleTypeFare',
    key: 'vehicleTypeFare',
  },
];

interface PassengerRate {
  key: number;
  cabinTypeName?: string;
  cabinTypeFare: number;
}

interface VehicleRate {
  key: number;
  vehicleTypeName?: string;
  vehicleTypeFare: number;
}
