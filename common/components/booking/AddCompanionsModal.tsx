import Passenger from '@/common/models/passenger';
import { Checkbox, Modal, ModalProps, Typography } from 'antd';
import { useState } from 'react';
import { CheckboxValueType } from 'antd/es/checkbox/Group';

const { Title } = Typography;

interface AddCompanionsModalProps {
  loggedInPassenger?: Passenger;
  onSubmitCompanions: (companions: Passenger[]) => void;
}

export default function AddCompanionsModal({
  loggedInPassenger,
  onSubmitCompanions,
  onOk,
  ...modalProps
}: AddCompanionsModalProps & ModalProps) {
  const [selectedCompanionIndices, setSelectedCompanionIndices] = useState<
    CheckboxValueType[]
  >([]);

  const options = loggedInPassenger?.companions?.map((companion, index) => ({
    value: index,
    label: `${companion.firstName} ${companion.lastName}`,
  }));

  const onOkModal = () => {
    onSubmitCompanions(
      selectedCompanionIndices.map(
        (index) => loggedInPassenger?.companions?.[index]
      )
    );
  };

  return (
    <Modal onOk={onOkModal} {...modalProps}>
      <Title level={2}>Add Recent Companions</Title>
      <Checkbox.Group
        options={options}
        onChange={(checkedValues) => setSelectedCompanionIndices(checkedValues)}
      />
    </Modal>
  );
}
