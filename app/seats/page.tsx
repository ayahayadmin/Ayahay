'use client';
import { find, times } from 'lodash';
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

export default function Seats() {
  //props: shipId, trip preference, cabin type, floor, seats occupied
  const shipId = 1;
  const cabinType = CABIN_TYPE.Economy;
  const floor = 'second floor';

  const [rows, setRows] = useState(0);
  const [cols, setCols] = useState(0);
  const [bookedSeats, setBookedSeats] = useState([] as Seat[]);

  useEffect(() => {
    const fetchCabins = [
      mockCabinEconomy,
      mockCabinEconomy2,
      mockCabinBusiness,
      mockCabinFirst,
    ];
    const fetchSeats = mockSeats;
    setBookedSeats(fetchSeats);

    const cabin = find(fetchCabins, { shipId, type: cabinType, name: floor });
    setRows(cabin!.numOfRows);
    setCols(cabin!.numOfCols);
  }, []);

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
        <label>Select a cabin</label>
        <select id='movie'>
          <option value='220'>{CABIN_TYPE.Economy}</option>
          <option value='320'>{CABIN_TYPE.Business}</option>
          <option value='250'>{CABIN_TYPE.First}</option>
        </select>
      </div>

      {/* <ul className={styles.showcase}>
        <li>
          <div className={styles.seat}></div>
          <small>Available</small>
        </li>
        <li>
          <div className={`${styles.seat} ${styles.selected}`}></div>
          <small>Selected</small>
        </li>
        <li>
          <div className={`${styles.seat} ${styles.sold}`}></div>
          <small>Sold</small>
        </li>
      </ul> */}
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

      <p className={styles.text}>
        You have selected <span id='count'>0</span> seat for a price of RS.
        <span id='total'>0</span>
      </p>
    </div>
  );
}
