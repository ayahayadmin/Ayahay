import React, { useEffect, useState } from 'react';
import { ITrip, mockTrips } from '@ayahay/models/trip.model';
import { filter, split } from 'lodash';
import { getTime } from '@/services/search.service';
import { DatePicker, Table } from 'antd';
import { useRouter } from 'next/navigation';
import { IShippingLine } from '@ayahay/models/shipping-line.model';
import { IPort } from '@ayahay/models/port.model';
import dayjs, { Dayjs } from 'dayjs';
import { RangePickerProps } from 'antd/es/date-picker';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

const { RangePicker } = DatePicker;
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const PAGE_SIZE = 10;

export default function TripList() {
  const dateToday = dayjs();
  const router = useRouter();
  const [tripsData, setTripsData] = useState([] as ITrip[]);
  const [startDate, setStartDate] = useState(dateToday.startOf('day') as Dayjs);
  const [endDate, setEndDate] = useState(dateToday.endOf('day') as Dayjs);

  const columns = [
    {
      key: 'logo',
      dataIndex: 'shippingLine',
      render: (text: IShippingLine) => (
        <img
          src='/assets/logo-placeholder.png'
          alt={`${text.name} Logo`}
          height={80}
        />
      ),
    },
    {
      title: 'Shipping Line',
      key: 'shippingLine',
      dataIndex: 'shippingLine',
      render: (text: IShippingLine) => <span>{text.name}</span>,
    },
    {
      title: 'Origin',
      key: 'srcPort',
      dataIndex: 'srcPort',
      render: (text: IPort) => <span>{text.name}</span>,
    },
    {
      title: 'Destination',
      key: 'destPort',
      dataIndex: 'destPort',
      render: (text: IPort) => <span>{text.name}</span>,
    },
    {
      title: 'Departure Date',
      key: 'departureDate',
      dataIndex: 'departureDateIso',
      render: (text: string) => <span>{split(text, 'T')[0]}</span>,
    },
    {
      title: 'Departure Time',
      key: 'departureTime',
      dataIndex: 'departureDateIso',
      render: (text: string) => <span>{getTime(text)}</span>,
    },
    {
      title: 'Slots',
      key: 'slots',
      dataIndex: 'slots',
      render: (text: string) => <span>{`${text} slot/s`}</span>,
    },
  ];

  useEffect(() => {
    const trips = filter(mockTrips, (trip) => {
      return (
        startDate.isSameOrBefore(trip.departureDateIso) &&
        endDate.isSameOrAfter(trip.departureDateIso)
      );
    });

    setTripsData(trips);
  }, [startDate, endDate]);

  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    return current && current < dayjs().startOf('day');
  };

  const onChange: RangePickerProps['onChange'] = (date, dateString) => {
    setStartDate(dayjs(dateString[0]).startOf('day'));
    setEndDate(dayjs(dateString[1]).endOf('day'));
  };

  return (
    <div>
      <div>
        <RangePicker
          defaultValue={[startDate, endDate]}
          disabledDate={disabledDate}
          onChange={onChange}
        />
      </div>
      <div>
        <Table
          columns={columns}
          dataSource={tripsData}
          // className={styles.searchResult}
          onRow={(record, rowIdx) => {
            return {
              onClick: (event) => {
                router.push(`/schedules/${record.id}`);
              },
            };
          }}
          pagination={false}
        ></Table>
      </div>
    </div>
  );
}
