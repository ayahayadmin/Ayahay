import { IPassenger, IPassengerVehicle } from '@ayahay/models';
import { Checkbox, Modal, ModalProps, Typography } from 'antd';
import { useState } from 'react';
import { CheckboxValueType } from 'antd/es/checkbox/Group';

const { Title } = Typography;

interface AddVehiclesModalProps {
  loggedInPassenger?: IPassenger;
  onSubmitVehicles: (vehicles: IPassengerVehicle[]) => void;
}

export default function AddVehiclesModal({
  loggedInPassenger,
  onSubmitVehicles,
  onOk,
  ...modalProps
}: AddVehiclesModalProps & ModalProps) {
  const [selectedVehicleIndices, setSelectedVehicleIndices] = useState<
    CheckboxValueType[]
  >([]);

  const options = loggedInPassenger?.vehicles?.map((vehicle, index) => ({
    value: index,
    label: `${vehicle.modelName} ${vehicle.modelYear} ${vehicle.plateNo}`,
  }));

  const onOkModal = () => {
    onSubmitVehicles(
      selectedVehicleIndices.map(
        (index) => loggedInPassenger?.vehicles?.[index]
      )
    );
  };

  return (
    <Modal onOk={onOkModal} {...modalProps}>
      <Title level={2}>Add Registered Vehicles</Title>
      <Checkbox.Group
        options={options}
        onChange={(checkedValues) => setSelectedVehicleIndices(checkedValues)}
      />
    </Modal>
  );
}
