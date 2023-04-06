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

export default function Seats() {
  //props: shipId, trip preference, cabin type, floor
  const shipId = 1;
  const cabinType = CABIN_TYPE.Economy;
  const floor = 'second floor';
  const bookedSeats = [
    { row: 0, column: 1 },
    { row: 5, column: 5 },
    { row: 19, column: 5 },
  ];

  const [rows, setRows] = useState(0);
  const [cols, setCols] = useState(0);
  const [seatState, setSeatState] = useState(false);

  useEffect(() => {
    const fetchCabins = [
      mockCabinEconomy,
      mockCabinEconomy2,
      mockCabinBusiness,
      mockCabinFirst,
    ];

    const cabin = find(fetchCabins, { shipId, type: cabinType, name: floor });
    setRows(cabin!.numOfRows);
    setCols(cabin!.numOfCols);
  });

  const onSeatClick = (row: number, col: number) => {
    console.log(`${row} ${col}`);

    setSeatState(!seatState);
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
                  row: rowIdx,
                  column: colIdx,
                })
                  ? styles.sold
                  : '';
                const selectedClassName = styles.selected;
                return (
                  <div
                    className={
                      seatState
                        ? `${seatClassName} ${selectedClassName}`
                        : `${seatClassName} ${soldClassName}`
                    }
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

{
  /* <div className={styles.row}>
  <div className={styles.seat}></div>
  <div className={styles.seat}></div>
  <div className={styles.seat}></div>
  <div className={styles.seat}></div>
  <div className={styles.seat}></div>
  <div className={styles.seat}></div>
  <div className={styles.seat}></div>
  <div className={styles.seat}></div>
</div>

<div className={styles.row}>
  <div className={styles.seat}></div>
  <div className={styles.seat}></div>
  <div className={styles.seat}></div>
  <div className={`${styles.seat} ${styles.sold}`}></div>
  <div className={`${styles.seat} ${styles.sold}`}></div>
  <div className={styles.seat}></div>
  <div className={styles.seat}></div>
  <div className={styles.seat}></div>
</div>
<div className={styles.row}>
  <div className={styles.seat}></div>
  <div className={styles.seat}></div>
  <div className={styles.seat}></div>
  <div className={styles.seat}></div>
  <div className={styles.seat}></div>
  <div className={styles.seat}></div>
  <div className={`${styles.seat} ${styles.sold}`}></div>
  <div className={`${styles.seat} ${styles.sold}`}></div>
</div>
<div className={styles.row}>
  <div className={styles.seat}></div>
  <div className={styles.seat}></div>
  <div className={styles.seat}></div>
  <div className={styles.seat}></div>
  <div className={styles.seat}></div>
  <div className={styles.seat}></div>
  <div className={styles.seat}></div>
  <div className={styles.seat}></div>
</div>
<div className={styles.row}>
  <div className={styles.seat}></div>
  <div className={styles.seat}></div>
  <div className={styles.seat}></div>
  <div className={`${styles.seat} ${styles.sold}`}></div>
  <div className={`${styles.seat} ${styles.sold}`}></div>
  <div className={styles.seat}></div>
  <div className={styles.seat}></div>
  <div className={styles.seat}></div>
</div>
<div className={styles.row}>
  <div className={styles.seat}></div>
  <div className={styles.seat}></div>
  <div className={styles.seat}></div>
  <div className={styles.seat}></div>
  <div className={`${styles.seat} ${styles.sold}`}></div>
  <div className={`${styles.seat} ${styles.sold}`}></div>
  <div className={`${styles.seat} ${styles.sold}`}></div>
  <div className={styles.seat}></div>
</div> */
}
