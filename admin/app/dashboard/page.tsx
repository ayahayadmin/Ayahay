'use client';
import {
  IBookingPassenger,
  mockBookingPassengers,
  mockBookings,
} from '@/../packages/models';
import BarChart from '@/components/charts/barChart';
import { getAllTrips } from '@/services/trip.service';
import { DatePicker } from 'antd';
import { RangePickerProps } from 'antd/es/date-picker';
import dayjs, { Dayjs } from 'dayjs';
import { filter, forEach, includes, isEmpty, keys, map } from 'lodash';
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

interface CheckedInToTrip {
  [key: string]: number;
}

export default function Dashboard() {
  const dateToday = dayjs();
  const [startMonth, setStartMonth] = useState(
    dateToday.startOf('month') as Dayjs
  );
  const [endMonth, setEndMonth] = useState(dateToday.endOf('month') as Dayjs);
  const [tripNames, setTripNames] = useState([] as string[]);
  const [tripWithBookingPassengers, setTripWithBookingPassengers] = useState(
    {} as TripToBookingPassenger
  );
  const [checkedInCount, setCheckedInCount] = useState({} as CheckedInToTrip);

  const countCheckedInBookingPassenger = (bookingPassengers: any) => {
    return filter(bookingPassengers, (bookingPassenger) => {
      return !isEmpty(bookingPassenger?.checkInDate); //returns bookingPassenger that has checkInDate property
    }).length;
  };

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

    // Maps tripId: tripName
    const tripIdAndName: TripIdToTripName = trips.reduce((acc, curr) => {
      return {
        ...acc,
        [curr.id]: `${curr?.srcPort?.name}-${curr?.destPort?.name}`,
      };
    }, {});

    const tripIds = keys(tripIdAndName);

    // Gets all bookings given trip Ids
    const bookingsTemp = mockBookings.filter((booking) =>
      includes(tripIds, String(booking.tripId))
    );

    let bookingPassengersToTripMap: TripToBookingPassenger = {};
    let tripNameKey: string[] = [];
    let checkedInCountPerTrip: CheckedInToTrip = {};
    // Maps trip name (src-dest) to bookingPassengers
    forEach(bookingsTemp, (booking) => {
      const key = tripIdAndName[String(booking.tripId)];
      const bookingPassengers = filter(mockBookingPassengers, {
        bookingId: booking.id,
      });

      if (bookingPassengersToTripMap.hasOwnProperty(key)) {
        bookingPassengersToTripMap = {
          ...bookingPassengersToTripMap,
          [key]: [...bookingPassengersToTripMap[key], ...bookingPassengers],
        };
        checkedInCountPerTrip = {
          ...checkedInCountPerTrip,
          [key]:
            checkedInCountPerTrip[key] +
            countCheckedInBookingPassenger(bookingPassengers),
        };
      } else {
        bookingPassengersToTripMap[key] = bookingPassengers;
        tripNameKey.push(key);
        checkedInCountPerTrip[key] =
          countCheckedInBookingPassenger(bookingPassengers);
      }
    });

    console.log(tripNameKey);
    console.log(bookingPassengersToTripMap);
    console.log(checkedInCountPerTrip);

    setTripNames(tripNameKey);
    setTripWithBookingPassengers(bookingPassengersToTripMap);
    setCheckedInCount(checkedInCountPerTrip);

    // //TO DO: With bookingPassenger:
    // - Count how many passengers booked per trip (bar) CHECK
    // - Count how many checked-in (and not) (bar kasama sa bullet 1) CHECK
    // - Count overall passengers given date range (number)
    // - Check if isEmpty() really works on all cases, like what if ''/undefined/null si checkInDate?
  }, [startMonth, endMonth]);

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
        <BarChart
          data={{
            labels: [...tripNames],
            datasets: [
              {
                label: 'Not Checked-in Passengers',
                data: [
                  ...map(tripNames, (tripName) => {
                    return (
                      tripWithBookingPassengers[tripName].length -
                      checkedInCount[tripName]
                    );
                  }),
                ],
                hoverOffset: 4,
              },
              {
                label: 'Checked-in Passengers',
                data: [
                  ...map(tripNames, (tripName) => {
                    return checkedInCount[tripName];
                  }),
                ],
                hoverOffset: 14,
              },
            ],
          }}
        />
      </div>
    </div>
  );
}
