'use client';
import React from 'react';
import { Button, DatePicker, Form, Radio } from 'antd';
import PortAutoComplete from '@/common/components/form/PortAutoComplete';
import PassengerCount from '@/common/components/form/PassengerCount';

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
          name='srcPortId'
          rules={[{ required: true, message: 'Please select an origin port.' }]}
        />
        <PortAutoComplete
          excludePortId={srcPortId}
          label='Destination Port'
          name='destPortId'
          rules={[
            { required: true, message: 'Please select a destination port.' },
          ]}
        />
        <Form.Item
          label='Departure Date'
          name='departureDate'
          rules={[
            { required: true, message: 'Please select a departure date.' },
          ]}
        >
          <DatePicker format='MMM D, YYYY' allowClear={false} />
        </Form.Item>
        {tripType === 'round' && (
          <Form.Item
            label='Return Date'
            name='returnDate'
            rules={[
              { required: true, message: 'Please select a return date.' },
            ]}
          >
            <DatePicker format='MMM D, YYYY' allowClear={false} />
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
