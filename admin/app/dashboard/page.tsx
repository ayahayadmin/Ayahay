'use client';
import {
  IBookingPassenger,
  mockBookingPassengers,
  mockBookings,
} from '@/../packages/models';
import BarChart from '@/components/charts/barChart';
import PieChart from '@/components/charts/pieChart';
import { getAllTrips } from '@/services/trip.service';
import { DatePicker } from 'antd';
import { RangePickerProps } from 'antd/es/date-picker';
import dayjs, { Dayjs } from 'dayjs';
import { filter, forEach, includes, keys } from 'lodash';
import { useEffect, useState } from 'react';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

const { RangePicker } = DatePicker;
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

interface TripIdToTripName {
  [key: string]: string;
}

interface TripToBookingPassenger {
  [key: string]: IBookingPassenger[];
}

const data = {
  labels: ['Red', 'Blue', 'Yellow'],
  datasets: [
    {
      label: 'My First Dataset',
      data: [300, 50, 100],
      backgroundColor: [
        'rgb(255, 99, 132)',
        'rgb(54, 162, 235)',
        'rgb(255, 205, 86)',
      ],
      hoverOffset: 4,
    },
  ],
};

export default function Dashboard() {
  const dateToday = dayjs();
  const [startMonth, setStartMonth] = useState(
    dateToday.startOf('month') as Dayjs
  );
  const [endMonth, setEndMonth] = useState(dateToday.endOf('month') as Dayjs);

  useEffect(() => {
    // const bookingPassengers = getBookingPassengersByTripId(tripId); // still waiting for Carlos to update
    // console.log(bookingPassengers);

    // might want to create a function in .service.tsx, cuz ginagamit din to ni tripList.tsx
    const trips = filter(getAllTrips(), (trip) => {
      return (
        startMonth.isSameOrBefore(trip.departureDateIso) &&
        endMonth.isSameOrAfter(trip.departureDateIso)
      );
    });

    const tripIdAndName: TripIdToTripName = trips.reduce((acc, curr) => {
      return {
        ...acc,
        [curr.id]: `${curr?.srcPort?.name}-${curr?.destPort?.name}`,
      };
    }, {});

    const tripIds = keys(tripIdAndName);
    const bookingsTemp = mockBookings.filter((booking) =>
      includes(tripIds, String(booking.tripId))
    );

    let bookingPassengersToTripMap: TripToBookingPassenger = {};

    forEach(bookingsTemp, (booking) => {
      const key = tripIdAndName[String(booking.tripId)];
      const bookingPassengers = filter(mockBookingPassengers, {
        bookingId: booking.id,
      });
      console.log(key);
      console.log(bookingPassengers);

      if (bookingPassengersToTripMap.hasOwnProperty(key)) {
        bookingPassengersToTripMap = {
          ...bookingPassengersToTripMap,
          [key]: [...bookingPassengersToTripMap[key], ...bookingPassengers],
        };
        console.log(bookingPassengersToTripMap);
      } else {
        bookingPassengersToTripMap[key] = bookingPassengers;
        console.log(bookingPassengersToTripMap);
      }
    });
    // //TO DO: With bookingPassenger:
    // - Count how many passengers booked per trip (bar)
    // - Count how many checked-in (and not) (bar kasama sa bullet 1)
    // - Count overall passengers given date range (number)
  }, []);

  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    const lastYear = dateToday.subtract(1, 'year');
    return lastYear && current < lastYear.startOf('day');
  };

  const onChange: RangePickerProps['onChange'] = (date, dateString) => {
    setStartMonth(dayjs(dateString[0]).startOf('day'));
    setEndMonth(dayjs(dateString[1]).endOf('day'));
  };

  return (
    <div>
      <div>
        <RangePicker
          defaultValue={[startMonth, endMonth]}
          disabledDate={disabledDate}
          onChange={onChange}
        />
      </div>
      <div>
        <BarChart data={data} />
      </div>
    </div>
  );
}
