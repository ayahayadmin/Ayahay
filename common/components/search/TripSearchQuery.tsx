'use client';
import React from 'react';
import { Button, DatePicker, Form, Radio } from 'antd';
import PortAutoComplete from '@/common/components/form/PortAutoComplete';
import PassengerCount from '@/common/components/form/PassengerCount';
import styles from './TripSearchQuery.module.scss';
import dayjs from 'dayjs';

export default function TripSearchQuery() {
  const form = Form.useFormInstance();
  const tripType = Form.useWatch('tripType', form);
  const srcPortId = Form.useWatch('srcPortId', form);
  const destPortId = Form.useWatch('destPortId', form);

  return (
    <>
      <div id='search-type'>
        <Form.Item name='tripType'>
          <Radio.Group>
            <Radio value='single'>Single Trip</Radio>
            <Radio value='round'>Round Trip</Radio>
          </Radio.Group>
        </Form.Item>
      </div>

      <div id='search-main'>
        <PortAutoComplete
          excludePortId={destPortId}
          label='Origin Port'
          labelCol={{ span: 24 }}
          colon={false}
          name='srcPortId'
        />
        <PortAutoComplete
          excludePortId={srcPortId}
          label='Destination Port'
          labelCol={{ span: 24 }}
          colon={false}
          name='destPortId'
        />
        <Form.Item
          label='Departure Date'
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
        <PassengerCount />
        <Form.Item>
          <Button type='primary' htmlType='submit'>
            Submit
          </Button>
        </Form.Item>
      </div>
    </>
  );
}
