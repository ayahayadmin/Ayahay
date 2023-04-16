'use client';
import React from 'react';
import { Button, DatePicker, Form, Radio } from 'antd';
import PortAutoComplete from '@/common/components/form/PortAutoComplete';
import PassengerCount from '@/common/components/form/PassengerCount';
import styles from './TripSearchQuery.module.scss';
import dayjs from 'dayjs';
import EnumRadio from '@/common/components/form/EnumRadio';
import { TRIP_TYPE } from '@/common/constants/enum';

export default function TripSearchQuery() {
  const form = Form.useFormInstance();
  const tripType = Form.useWatch('tripType', form);
  const srcPortId = Form.useWatch('srcPortId', form);
  const destPortId = Form.useWatch('destPortId', form);

  return (
    <article className={styles['trip-search-query']}>
      <div className={styles['search-container']}>
        <div className={styles['search-type']}>
          <EnumRadio _enum={TRIP_TYPE} name='tripType' disabled={false} />
        </div>

        <div className={styles['search-main']}>
          <div className={styles['port-card']}>
            <label>Origin Port</label>
            <PortAutoComplete
              excludePortId={destPortId}
              labelCol={{ span: 24 }}
              colon={false}
              name='srcPortId'
            />
          </div>
          <div className={styles['port-card']}>
            <label>Destination Port</label>
            <PortAutoComplete
              excludePortId={srcPortId}
              labelCol={{ span: 24 }}
              colon={false}
              name='destPortId'
            />
          </div>
          <div className={styles['date-card']}>
            <label>Departure Date</label>
            <Form.Item
              labelCol={{ span: 24 }}
              colon={false}
              name='departureDate'
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
          <div className={styles['travellers-card']}>
            <PassengerCount />
          </div>
          <Form.Item>
            <Button type='primary' htmlType='submit'>
              Submit
            </Button>
          </Form.Item>
        </div>
      </div>
    </article>
  );
}
