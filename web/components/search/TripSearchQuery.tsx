'use client';
import React from 'react';
import { Button, DatePicker, Form, Radio } from 'antd';
import PortAutoComplete from '@/components/form/PortAutoComplete';
import PassengerCount from '@/components/form/PassengerCount';
import styles from './TripSearchQuery.module.scss';
import dayjs from 'dayjs';
import EnumRadio from '@/components/form/EnumRadio';
import { TRIP_TYPE } from '@ayahay/constants/enum';
import VehicleCount from '../form/VehicleCount';

export default function TripSearchQuery({
  ...htmlAttributes
}: React.HTMLAttributes<HTMLElement>) {
  const form = Form.useFormInstance();
  const tripType = Form.useWatch('tripType', form);
  const srcPortId = Form.useWatch('srcPortId', form);
  const destPortId = Form.useWatch('destPortId', form);

  return (
    <article
      className={`${styles['trip-search-query']} ${htmlAttributes.className}`}
    >
      <div className={styles['search-container']}>
        <div className={styles['search-type']}>
          <EnumRadio _enum={TRIP_TYPE} name='tripType' disabled={false} />
        </div>

        <article className={styles['search-main']}>
          <div className={styles['search-input-wrapper']}>
            <label>Origin Port</label>
            <PortAutoComplete
              excludePortId={destPortId}
              labelCol={{ span: 24 }}
              colon={false}
              name='srcPortId'
              style={{ marginBottom: 0 }}
            />
          </div>
          <div className={styles['search-input-wrapper']}>
            <label>Destination Port</label>
            <PortAutoComplete
              excludePortId={srcPortId}
              labelCol={{ span: 24 }}
              colon={false}
              name='destPortId'
              style={{ marginBottom: 0 }}
            />
          </div>
          <div className={styles['search-input-wrapper']}>
            <label>Departure Date</label>
            <Form.Item
              labelCol={{ span: 24 }}
              colon={false}
              name='departureDate'
              style={{ marginBottom: 0 }}
            >
              <DatePicker
                className={styles['ant-picker-input']}
                disabledDate={(current) => current < dayjs().endOf('day')}
                format='MMM D, YYYY'
                allowClear={false}
                bordered={false}
                size='large'
              />
            </Form.Item>
            {tripType === 'round' && (
              <Form.Item
                label='Return Date'
                labelCol={{ span: 24 }}
                colon={false}
                name='returnDate'
                style={{ marginBottom: 0 }}
              >
                <DatePicker
                  className={styles['ant-picker-input']}
                  format='MMM D, YYYY'
                  allowClear={false}
                  bordered={false}
                  size='large'
                />
              </Form.Item>
            )}
          </div>
          <div className={styles['search-input-wrapper']}>
            <PassengerCount />
          </div>
          <div
            className={styles['search-input-wrapper']}
            style={{ borderRight: 0, fontSize: '16px' }}
          >
            <VehicleCount />
          </div>
          <Form.Item style={{ marginBottom: 0, padding: '10px 20px' }}>
            <Button type='primary' htmlType='submit' block>
              Submit
            </Button>
          </Form.Item>
        </article>
      </div>
    </article>
  );
}
