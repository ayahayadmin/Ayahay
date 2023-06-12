'use client';
import { IBookingPassenger } from '@/../packages/models';
import BarChart from '@/components/charts/barChart';
import { getAllTrips } from '@/services/trip.service';
import { DatePicker } from 'antd';
import { RangePickerProps } from 'antd/es/date-picker';
import dayjs, { Dayjs } from 'dayjs';
import { filter, forEach, isEmpty, keys, map, sum } from 'lodash';
import { useEffect, useState } from 'react';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { getBookingPassengersByTripId } from '@/services/booking-passenger.service';
import styles from './page.module.scss';

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
    // TO DO: might want to create a function in .service.tsx, cuz ginagamit din to ni tripList.tsx
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

    let bookingPassengersToTripMap: TripToBookingPassenger = {};
    let tripNameKey: string[] = [];
    let checkedInCountPerTrip: CheckedInToTrip = {};
    // Maps trip name (src-dest) to bookingPassengers
    forEach(tripIds, (tripId) => {
      const key = tripIdAndName[tripId];
      const bookingPassengers = getBookingPassengersByTripId(Number(tripId));

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

    setTripNames(tripNameKey);
    setTripWithBookingPassengers(bookingPassengersToTripMap);
    setCheckedInCount(checkedInCountPerTrip);

    // //TO DO: With bookingPassenger:
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
        <h1>
          Passenger count:{' '}
          {sum(
            map(tripWithBookingPassengers, (trip) => {
              return trip.length;
            })
          )}
        </h1>
      </div>
      <div className={styles['bar-graph']}>
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
