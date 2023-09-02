import { Button, Form, InputNumber, Popover, Space } from 'antd';
import React from 'react';
import {
  DEFAULT_NUM_PASSENGERS,
  DEFAULT_NUM_VEHICLES,
} from '@ayahay/constants/default';

export default function PassengerAndVehicleCount() {
  const form = Form.useFormInstance();

  const numPassengers = Form.useWatch('numPassengers', form);
  const numVehicles = Form.useWatch('numVehicles', form);

  const countPopoverContent = (
    <div>
      <CountPopover label='Passenger' inputName='numPassengers' />
      <CountPopover label='Vehicle' inputName='numVehicles' />
    </div>
  );

  return (
    <Popover
      placement='bottomLeft'
      title='Passengers/Vehicles'
      content={countPopoverContent}
      trigger='click'
    >
      <label>Passengers | Vehicles</label>
      <div style={{ padding: '6.5px 11px' }}>
        <span>{numPassengers ?? DEFAULT_NUM_PASSENGERS} Passenger | </span>
        <span>{numVehicles ?? DEFAULT_NUM_VEHICLES} Vehicle </span>
      </div>
      <Form.Item name='numPassengers' hidden={true}>
        <InputNumber />
      </Form.Item>
      <Form.Item name='numVehicles' hidden={true}>
        <InputNumber />
      </Form.Item>
    </Popover>
  );
}

interface CountPopoverProps {
  label: string;
  inputName: string;
}

function CountPopover({ label, inputName }: CountPopoverProps) {
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
      <Space>
        <span>{label}</span>
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
      </Space>
    </div>
  );
}
