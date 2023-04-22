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

const blockInfoInitial = {
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
  const preSelectedValue = `${split(cabinType, ' ')[0]},${floor}`;

  const [options, setOptions] = useState(
    [] as { value: string; label: string }[]
  );
  const [rows, setRows] = useState(0);
  const [cols, setCols] = useState(0);
  const [seatLayout, setSeatLayout] = useState([] as Seat[]);
  const [bookedSeats, setBookedSeats] = useState([] as Seat[]);
  const [selectedCabin, setSelectedCabin] = useState(preSelectedValue);
  const [capacity, setCapacity] = useState(0);
  const [passengersBooked, setPassengersBooked] = useState(
    [] as BookingPassenger[]
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [blockInfo, setBlockInfo] = useState({ ...blockInfoInitial });
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
    setSeatLayout(cabin.seats);
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
    const blockElement = document.getElementById(`${row} ${col}`);
    if (
      blockElement?.classList.contains(`${styles.block}`) &&
      blockElement?.classList.contains(`${styles.sold}`)
    ) {
      const passengersInSeat: BookingPassenger[] = passengersBooked.filter(
        (passenger) =>
          passenger.seat?.rowNumber === row &&
          passenger.seat.columnNumber === col
      );
      let blockInfo = {
        sold: true,
        location: '',
        name: '',
        type: '',
      };
      let passengerInfo: PassengerInfo[] = [];

      forEach(passengersInSeat, (passengerInSeat) => {
        const seat = passengerInSeat.seat;
        const passenger = passengerInSeat.passenger;
        blockInfo = {
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

      setBlockInfo(blockInfo);
      setPassengerInfo(passengerInfo);
    } else {
      const fetchSeats = mockSeats;
      const seat = find(fetchSeats, { rowNumber: row, columnNumber: col });
      setBlockInfo({
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
    setBlockInfo(blockInfoInitial);
    setPassengerInfo([]);
    setIsModalOpen(false);
  };

  const onModalCancelClick = () => {
    setBlockInfo(blockInfoInitial);
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
          let blockClassName = styles.block;
          return (
            <div className={styles.row}>
              {times(cols, (colIdx) => {
                let soldClassName = find(bookedSeats, {
                  rowNumber: rowIdx,
                  columnNumber: colIdx,
                })
                  ? styles.sold
                  : '';
                let blockLabel = find(seatLayout, {
                  rowNumber: rowIdx,
                  columnNumber: colIdx,
                })?.name;
                return (
                  <div
                    className={`${blockClassName} ${soldClassName}`}
                    id={`${rowIdx} ${colIdx}`}
                    onClick={() => onSeatClick(rowIdx, colIdx)}
                  >
                    {blockLabel}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* <div className={styles.text}>
        Total cabin capacity: <span>{capacity}</span>
        <br></br>
        Seats left unoccupied: <span>{capacity - bookedSeats.length}</span>
      </div> */}

      <Modal
        title='More Info'
        open={isModalOpen}
        onOk={onModalOkClick}
        onCancel={onModalCancelClick}
      >
        <h3>Block Information:</h3>
        <div>
          <p>
            {blockInfo.sold
              ? `Block is occupied by ${passengerInfo.length} passenger/s`
              : 'Block is unoccupied'}
          </p>
          <p>Location: {blockInfo.location}</p>
          <p>Name: {blockInfo.name}</p>
          <p>Type: {blockInfo.type}</p>
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
