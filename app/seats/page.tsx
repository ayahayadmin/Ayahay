'use client';
import { filter, find, get, map, split, times, upperFirst } from 'lodash';
import styles from './page.module.scss';
import { useEffect, useState } from 'react';
import { CABIN_TYPE } from '@/common/constants/enum';
import Seat from '@/common/models/seat.model';
import { Select } from 'antd';
import { mockShips } from '@/common/models/ship.model';
import { mockTrip } from '@/common/models/trip.model';
import { getAllBookingsOfTrip } from '@/common/services/booking.service';
import { mockBookingPassengers } from '@/common/models/booking-passenger.model';
import { mockBookings } from '@/common/models/booking.model';

export default function Seats() {
  //props: shipId, trip preference, Cabin object (cabin type & floor), seats occupied
  const trip = mockTrip;
  const shipId = 1;
  const cabinType = CABIN_TYPE.Economy;
  const floor = 'second floor';
  const preSelectedValue = `${cabinType},${floor}`;

  const [options, setOptions] = useState(
    [] as { value: string; label: string }[]
  );
  const [rows, setRows] = useState(0);
  const [cols, setCols] = useState(0);
  const [bookedSeats, setBookedSeats] = useState([] as Seat[]);
  const [selectedCabin, setSelectedCabin] = useState(preSelectedValue);
  const [capacity, setCapacity] = useState(0);

  useEffect(() => {
    const fetchShip = mockShips;
    const fetchBookings = mockBookings; //getAllBookingsOfTrip(trip.id);
    const fetchBookingPassenger = mockBookingPassengers;

    const [type, name] = split(selectedCabin, ',');

    const ship = find(fetchShip, { id: shipId });
    const cabins = get(ship, 'cabins');
    const filteredBookings = filter(fetchBookings, { trip });

    const availableCabinType = map(cabins, (cabin) => {
      return {
        value: `${cabin.type},${cabin.name}`,
        label: `${cabin.type}, ${upperFirst(cabin.name)}`,
      };
    });
    const cabin: any = find(cabins, { type, name });
    const seatsBooked = map(filteredBookings, (booking) => {
      const occupiedSeat = get(
        find(fetchBookingPassenger, { bookingId: booking.id }),
        'seat'
      );
      return occupiedSeat!;
    });

    setOptions(availableCabinType);
    setRows(cabin!.numOfRows);
    setCols(cabin!.numOfCols);
    setCapacity(cabin!.passengerCapacity);
    setBookedSeats(seatsBooked);
  }, [selectedCabin]);

  const onChange = (value: string) => {
    const selectedSeatsElement = document.getElementsByClassName(
      `${styles.selected}`
    );

    while (selectedSeatsElement.length) {
      selectedSeatsElement[0].classList.remove(`${styles.selected}`);
    }

    setSelectedCabin(value);
  };

  const onSeatClick = (row: number, col: number) => {
    const seatElement = document.getElementById(`${row} ${col}`);
    if (
      seatElement?.classList.contains(`${styles.seat}`) &&
      !seatElement?.classList.contains(`${styles.selected}`)
    ) {
      seatElement!.classList.add(`${styles.selected}`);
    } else {
      seatElement!.classList.remove(`${styles.selected}`);
    }
  };

  return (
    <div>
      <div className={styles.movieContainer}>
        Cabin Type:{' '}
        <Select
          defaultValue={preSelectedValue}
          onChange={onChange}
          options={options}
        ></Select>
      </div>

      <div className={styles.container}>
        {times(rows, (rowIdx) => {
          let seatClassName = styles.seat;
          return (
            <div className={styles.row}>
              {times(cols, (colIdx) => {
                let soldClassName = find(bookedSeats, {
                  rowNumber: rowIdx,
                  columnNumber: colIdx,
                })
                  ? styles.sold
                  : '';
                return (
                  <div
                    className={`${seatClassName} ${soldClassName}`}
                    id={`${rowIdx} ${colIdx}`}
                    onClick={() => onSeatClick(rowIdx, colIdx)}
                  ></div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className={styles.text}>
        Total cabin capacity: <span>{capacity}</span>
        <br></br>
        Seats left unoccupied: <span>{capacity - bookedSeats.length}</span>
      </div>
    </div>
  );
}
