import { Button, Form, InputNumber, Popover } from 'antd';
import React from 'react';
import { DEFAULT_NUM_PASSENGERS } from '@ayahay/constants/default';

export default function PassengerCount() {
  const form = Form.useFormInstance();

  const numPassengers = Form.useWatch('numPassengers', form);

  const passengerCountPopoverContent = (
    <div>
      <PassengerCountPopover
        label='Passenger Count'
        inputName='numPassengers'
      />
    </div>
  );

  return (
    <Popover
      placement='bottomLeft'
      title='Passenger Count'
      content={passengerCountPopoverContent}
      trigger='click'
    >
      <label>Passengers</label>
      <div style={{ padding: '6.5px 11px' }}>
        <span>{numPassengers ?? DEFAULT_NUM_PASSENGERS} Passenger Count </span>
      </div>
      <Form.Item name='numPassengers' hidden={true}>
        <InputNumber />
      </Form.Item>
    </Popover>
  );
}

interface PassengerCountPopoverProps {
  label: string;
  inputName: string;
}

function PassengerCountPopover({ inputName }: PassengerCountPopoverProps) {
  const form = Form.useFormInstance();

  const numPassenger = Form.useWatch(inputName, form);

  const onDecrement = () => {
    form.setFieldValue(inputName, form.getFieldValue(inputName) - 1);
  };

  const onIncrement = () => {
    form.setFieldValue(inputName, form.getFieldValue(inputName) + 1);
  };

  return (
    <div>
      <div>
        <Button
          shape='circle'
          disabled={
            numPassenger === 0 ||
            (inputName === 'numPassengers' && numPassenger === 1)
          }
          onClick={() => onDecrement()}
        >
          -
        </Button>
        <span>{numPassenger}</span>
        <Button shape='circle' onClick={() => onIncrement()}>
          +
        </Button>
      </div>
    </div>
  );
}
