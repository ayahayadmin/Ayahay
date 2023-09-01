import { Button, Form, InputNumber, Popover } from 'antd';
import React from 'react';
import { DEFAULT_NUM_VEHICLES } from '@ayahay/constants/default';

export default function VehicleCount() {
  const form = Form.useFormInstance();

  const numVehicles = Form.useWatch('numVehicles', form);

  const vehicleCountPopoverContent = (
    <div>
      <VehicleCountPopover label='Vehicle Count' inputName='numVehicles' />
    </div>
  );

  return (
    <Popover
      placement='bottomLeft'
      title='Vehicle Count'
      content={vehicleCountPopoverContent}
      trigger='click'
    >
      <label>Vehicles</label>
      <div style={{ padding: '6.5px 11px' }}>
        <span>{numVehicles ?? DEFAULT_NUM_VEHICLES} Vehicle Count </span>
      </div>
      <Form.Item name='numVehicles' hidden={true}>
        <InputNumber />
      </Form.Item>
    </Popover>
  );
}

interface VehicleCountPopoverProps {
  label: string;
  inputName: string;
}

function VehicleCountPopover({ inputName }: VehicleCountPopoverProps) {
  const form = Form.useFormInstance();

  const numVehicle = Form.useWatch(inputName, form);

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
          disabled={numVehicle === 0}
          onClick={() => onDecrement()}
        >
          -
        </Button>
        <span>{numVehicle}</span>
        <Button shape='circle' onClick={() => onIncrement()}>
          +
        </Button>
      </div>
    </div>
  );
}
