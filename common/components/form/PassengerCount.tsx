'use client';
import { Button, Form, InputNumber, Popover } from 'antd';
import React from 'react';
import {
  DEFAULT_NUM_ADULTS,
  DEFAULT_NUM_CHILDREN,
  DEFAULT_NUM_INFANTS,
} from '@/common/constants/form';

export default function PassengerCount() {
  const form = Form.useFormInstance();

  const numAdults = Form.useWatch('numAdults', form);
  const numChildren = Form.useWatch('numChildren', form);
  const numInfants = Form.useWatch('numInfants', form);

  const passengerCountPopoverContent = (
    <div>
      <PassengerAgeCount label='Adults' inputName='numAdults' />
      <PassengerAgeCount label='Children' inputName='numChildren' />
      <PassengerAgeCount label='Infants' inputName='numInfants' />
    </div>
  );

  return (
    <Popover
      placement='bottomLeft'
      title='Passenger Count'
      content={passengerCountPopoverContent}
      trigger='click'
    >
      <span>{numAdults ?? DEFAULT_NUM_ADULTS} Adults | </span>
      <span>{numChildren ?? DEFAULT_NUM_CHILDREN} Children | </span>
      <span>{numInfants ?? DEFAULT_NUM_INFANTS} Infants</span>

      <Form.Item name='numAdults' hidden={true}>
        <InputNumber />
      </Form.Item>
      <Form.Item name='numChildren' hidden={true}>
        <InputNumber />
      </Form.Item>
      <Form.Item name='numInfants' hidden={true}>
        <InputNumber />
      </Form.Item>
    </Popover>
  );
}

interface PassengerAgeCountProps {
  label: string;
  inputName: string;
}

function PassengerAgeCount({ label, inputName }: PassengerAgeCountProps) {
  const form = Form.useFormInstance();

  const numPassengerOfAge = Form.useWatch(inputName, form);

  const onDecrement = () => {
    form.setFieldValue(inputName, form.getFieldValue(inputName) - 1);
  };

  const onIncrement = () => {
    form.setFieldValue(inputName, form.getFieldValue(inputName) + 1);
  };

  return (
    <div>
      <span>{label}</span>
      <div>
        <Button
          shape='circle'
          disabled={
            numPassengerOfAge === 0 ||
            (inputName === 'numAdults' && numPassengerOfAge === 1)
          }
          onClick={() => onDecrement()}
        >
          -
        </Button>
        <span>{numPassengerOfAge}</span>
        <Button shape='circle' onClick={() => onIncrement()}>
          +
        </Button>
      </div>
    </div>
  );
}
