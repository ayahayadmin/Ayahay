'use client';
import { filter, find, split, times } from 'lodash';
import styles from './page.module.scss';
import { useEffect, useState } from 'react';
import { CABIN_TYPE } from '@/common/constants/enum';
import {
  mockCabinBusiness,
  mockCabinEconomy,
  mockCabinEconomy2,
  mockCabinFirst,
} from '@/common/models/cabin.model';
import Seat, { mockSeats } from '@/common/models/seat.model';
import { Select } from 'antd';

const options = [
  //this is the available cabin and floors in a ship. mock for now
  { value: 'Economy,first floor', label: 'Economy, First Floor' },
  { value: 'Economy,second floor', label: 'Economy, Second Floor' },
  { value: 'Business,first floor', label: 'Business, First Floor' },
  { value: 'First,first floor', label: 'First, First Floor' },
];

export default function Seats() {
  //props: shipId, trip preference, Cabin object (cabin type & floor), seats occupied
  const shipId = 1;
  const cabinType = CABIN_TYPE.Economy;
  const floor = 'second floor';
  const preSelectedValue = `${split(cabinType, ' ')[0]},${floor}`;

  const [rows, setRows] = useState(0);
  const [cols, setCols] = useState(0);
  const [bookedSeats, setBookedSeats] = useState([] as Seat[]);
  const [selectedCabin, setSelectedCabin] = useState(preSelectedValue);
  const [capacity, setCapacity] = useState(0);

  useEffect(() => {
    const fetchCabins = [
      mockCabinEconomy,
      mockCabinEconomy2,
      mockCabinBusiness,
      mockCabinFirst,
    ];
    const fetchSeats = mockSeats;

    const [type, name] = split(selectedCabin, ',');

    const cabin = find(fetchCabins, {
      shipId,
      type: CABIN_TYPE[type as keyof typeof CABIN_TYPE],
      name,
    });
    const seatsBooked = filter(fetchSeats, {
      cabin: { type: CABIN_TYPE[type as keyof typeof CABIN_TYPE], name },
    });

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
