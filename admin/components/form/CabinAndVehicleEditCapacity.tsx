import { updateTripCabinCapacity } from '@/services/trip.service';
import { EditOutlined } from '@ant-design/icons';
import { ITripCabin } from '@ayahay/models';
import { Button, Form, InputNumber, Popover, Space, notification } from 'antd';
import { useState } from 'react';

interface CabinAndVehicleEditCapacityProps {
  tripId: number;
  cabins: ITripCabin[];
  vehicleCapacity: number;
}

export default function CabinAndVehicleEditCapacity({
  tripId,
  cabins,
  vehicleCapacity,
}: CabinAndVehicleEditCapacityProps) {
  const form = Form.useFormInstance();
  const [open, setOpen] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const changeCapacityLimit = (
    tripCabinsNewCapacity: any[],
    vehicleNewCapacity: any
  ) => {
    const request = {
      vehicleCapacity: vehicleNewCapacity,
      cabinCapacities: tripCabinsNewCapacity.map((tripCabin) => {
        return {
          cabinId: tripCabin.cabinId,
          passengerCapacity: tripCabin.form,
        };
      }),
    };
    try {
      updateTripCabinCapacity(tripId, request);
      setOpen(false);
      api.success({
        message: 'Update Capacity Success',
        description: 'The selected capacity has been updated successfully.',
      });
    } catch (e) {
      api.error({
        message: 'Update Capacity Failed',
        description: 'The selected capacity failed to update',
      });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const cabinInitialValues: any = cabins.reduce((acc, curr) => {
    return {
      ...acc,
      [`${tripId}${curr.cabinId}cabinCapacityCount`]: Number(
        curr.passengerCapacity
      ),
    };
  }, {});

  const tripCabinsForm = cabins.map((cabin) => {
    const label = cabin.cabin.cabinType!.name;
    const inputName = `${tripId}${cabin.cabinId}cabinCapacityCount`;
    return {
      cabinId: cabin.cabinId,
      label,
      inputName,
      form: Form.useWatch(`${inputName}`, form),
    };
  });
  const vehicleCapacityInputName = `${tripId}vehicleCapacityCount`;
  const vehicleCapacityCount = Form.useWatch(vehicleCapacityInputName, form);

  const countPopoverContent = (
    <div>
      {tripCabinsForm.map((tripCabin) => (
        <CountPopover
          label={tripCabin.label}
          inputName={tripCabin.inputName}
          minCapacity={cabinInitialValues[tripCabin.inputName]}
        />
      ))}
      <CountPopover
        label='Vehicle'
        inputName={vehicleCapacityInputName}
        minCapacity={vehicleCapacity}
      />
      <Form.Item style={{ marginBottom: 0, padding: '10px 20px' }}>
        <Button
          type='primary'
          htmlType='submit'
          onClick={() =>
            changeCapacityLimit(tripCabinsForm, vehicleCapacityCount)
          }
          block
        >
          Save Changes
        </Button>
      </Form.Item>
    </div>
  );

  return (
    <Form
      form={form}
      initialValues={{
        ...cabinInitialValues,
        [vehicleCapacityInputName]: vehicleCapacity,
      }}
    >
      {contextHolder}
      <Popover
        placement='bottomLeft'
        title='Capacities'
        content={countPopoverContent}
        trigger='click'
        open={open}
        onOpenChange={handleOpenChange}
      >
        <Button type='text'>
          <EditOutlined rev={undefined} />
        </Button>
        {tripCabinsForm.map((tripCabin) => (
          <Form.Item name={tripCabin.inputName} hidden={true}>
            <InputNumber />
          </Form.Item>
        ))}
        <Form.Item name={vehicleCapacityInputName} hidden={true}>
          <InputNumber />
        </Form.Item>
      </Popover>
    </Form>
  );
}

interface CountPopoverProps {
  label: string;
  inputName: string;
  minCapacity: number;
}

function CountPopover({ label, inputName, minCapacity }: CountPopoverProps) {
  const form = Form.useFormInstance();

  const numCapacity = Form.useWatch(inputName, form);

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
          disabled={numCapacity === minCapacity}
          onClick={() => onDecrement()}
        >
          -
        </Button>
        <span>{numCapacity}</span>
        <Button shape='circle' onClick={() => onIncrement()}>
          +
        </Button>
      </Space>
    </div>
  );
}
