'use client';
import {
  filter,
  find,
  forEach,
  get,
  isEmpty,
  map,
  split,
  times,
  upperFirst,
} from 'lodash';
import styles from './page.module.scss';
import { useEffect, useState } from 'react';
import { CABIN_TYPE } from '@/common/constants/enum';
import Seat, { mockSeats } from '@/common/models/seat.model';
import { Modal, Select } from 'antd';
import { mockShips } from '@/common/models/ship.model';
import { mockTrip } from '@/common/models/trip.model';
import { getAllBookingsOfTrip } from '@/common/services/booking.service';
import BookingPassenger, {
  mockBookingPassengers,
} from '@/common/models/booking-passenger.model';

interface PassengerInfo {
  name: string;
  occupation: string;
  birthday: string;
}

const seatInfoInitial = {
  sold: false,
  location: '',
  name: '',
  type: '',
};

export default function Seats() {
  //props: shipId, trip preference, Cabin object (cabin type & floor), seats occupied
  const trip = mockTrip;
  const shipId = 1;
  const cabinType = CABIN_TYPE.Economy;
  const floor = 'first floor';
  const preSelectedValue = `${cabinType},${floor}`;

  const [options, setOptions] = useState(
    [] as { value: string; label: string }[]
  );
  const [rows, setRows] = useState(0);
  const [cols, setCols] = useState(0);
  const [bookedSeats, setBookedSeats] = useState([] as Seat[]);
  const [selectedCabin, setSelectedCabin] = useState(preSelectedValue);
  const [capacity, setCapacity] = useState(0);
  const [passengersBooked, setPassengersBooked] = useState(
    [] as BookingPassenger[]
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [seatInfo, setSeatInfo] = useState({ ...seatInfoInitial });
  const [passengerInfo, setPassengerInfo] = useState([] as PassengerInfo[]);

  useEffect(() => {
    const bookingPassengers: BookingPassenger[] = [];
    const fetchShip = mockShips;
    const fetchBookings = getAllBookingsOfTrip(trip.id);
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
    const cabin: any = find(cabins, { type: split(type, ' ')[0], name });
    const seatsBooked = map(filteredBookings, (booking) => {
      const bookingPassenger = find(fetchBookingPassenger, {
        bookingId: booking.id,
      });
      bookingPassengers.push(bookingPassenger!);
      const occupiedSeat = get(bookingPassenger, 'seat');

      return occupiedSeat!;
    });

    setOptions(availableCabinType);
    setRows(cabin!.numOfRows);
    setCols(cabin!.numOfCols);
    setCapacity(cabin!.passengerCapacity);
    setBookedSeats(seatsBooked);
    setPassengersBooked(bookingPassengers);
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
      seatElement?.classList.contains(`${styles.sold}`)
    ) {
      const passengersInSeat: BookingPassenger[] = passengersBooked.filter(
        (passenger) =>
          passenger.seat?.rowNumber === row &&
          passenger.seat.columnNumber === col
      );
      let seatInfo = {
        sold: true,
        location: '',
        name: '',
        type: '',
      };
      let passengerInfo: PassengerInfo[] = [];

      forEach(passengersInSeat, (passengerInSeat) => {
        const seat = passengerInSeat.seat;
        const passenger = passengerInSeat.passenger;
        seatInfo = {
          sold: true,
          location: `${seat?.rowNumber}x${seat?.columnNumber}`,
          name: `${seat?.name}`,
          type: `${seat?.type}`,
        };
        passengerInfo.push({
          name: `${passenger?.firstName} ${passenger?.lastName}`,
          occupation: `${passenger?.occupation}`,
          birthday: `${passenger?.birthdayIso}`,
        });
      });

      setSeatInfo(seatInfo);
      setPassengerInfo(passengerInfo);
    } else {
      const fetchSeats = mockSeats;
      const seat = find(fetchSeats, { rowNumber: row, columnNumber: col });
      setSeatInfo({
        sold: false,
        location: `${seat?.rowNumber}x${seat?.columnNumber}`,
        name: `${seat?.name}`,
        type: `${seat?.type}`,
      });
    }
    setIsModalOpen(true);

    // if (
    //   seatElement?.classList.contains(`${styles.seat}`) &&
    //   !seatElement?.classList.contains(`${styles.selected}`)
    // ) {
    //   seatElement!.classList.add(`${styles.selected}`);
    // } else {
    //   seatElement!.classList.remove(`${styles.selected}`);
    // }
  };

  const onModalOkClick = () => {
    setSeatInfo(seatInfoInitial);
    setPassengerInfo([]);
    setIsModalOpen(false);
  };

  const onModalCancelClick = () => {
    setSeatInfo(seatInfoInitial);
    setPassengerInfo([]);
    setIsModalOpen(false);
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

      <Modal
        title='More Info'
        open={isModalOpen}
        onOk={onModalOkClick}
        onCancel={onModalCancelClick}
      >
        <h3>Seat Information:</h3>
        <div>
          <p>{seatInfo.sold ? 'Seat is occupied' : 'Seat is unoccupied'}</p>
          <p>Location: {seatInfo.location}</p>
          <p>Name: {seatInfo.name}</p>
          <p>Type: {seatInfo.type}</p>
        </div>

        {!isEmpty(passengerInfo) && <h3>Passenger Information:</h3>}
        <div>
          {map(passengerInfo, (passenger, idx) => {
            const { name, occupation, birthday } = passenger;
            return (
              <div>
                <h4>Passenger {idx + 1}</h4>
                <p>Name: {name}</p>
                <p>Occupation: {occupation}</p>
                <p>Birthday: {birthday}</p>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}
