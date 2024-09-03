'use client';
import { Button, Carousel, Typography } from 'antd';
import styles from './page.module.scss';
import React, { useRef } from 'react';

const { Title } = Typography;

export default function Partners() {
  const ref = useRef();

  return (
    <div className={styles['main-container']}>
      <Title level={1} style={{ fontSize: 30 }}>
        Partners
      </Title>
      <div>
        <Carousel draggable style={{ background: '#edf0fb' }} ref={ref}>
          <a href='https://aznarshipping.ph/' target='_blank'>
            <img
              className={styles['image']}
              alt='aznar'
              src='/assets/shipping-line-logos/E.B. Aznar Shipping Corporation.png'
            />
          </a>
          <a href='https://jomaliashipping.com/' target='_blank'>
            <img
              className={styles['image']}
              alt='jomalia'
              src='/assets/shipping-line-logos/Jomalia Shipping Corporation.png'
            />
          </a>
        </Carousel>
        <div className={styles['buttons']}>
          <Button
            style={{ width: 80 }}
            onClick={() => {
              ref.current.prev();
            }}
          >
            Previous
          </Button>
          <Button
            style={{ width: 80 }}
            onClick={() => {
              ref.current.next();
            }}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
