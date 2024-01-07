import { Form, Input, Modal, ModalProps, Typography } from 'antd';
import React from 'react';
import { useForm } from 'antd/es/form/Form';

const { Title } = Typography;

interface CreateVoyageModalProps {
  onCreateVoyage: (voyageRemarks: string) => Promise<void>;
}

export default function CreateVoyageModal({
  onCreateVoyage,
  onOk,
  ...modalProps
}: CreateVoyageModalProps & ModalProps) {
  const [form] = useForm();

  const onOkModal = async () => {
    try {
      await form.validateFields(['remarks']);
      await onCreateVoyage(form.getFieldValue('remarks'));
    } catch {}
  };

  return (
    <Modal onOk={onOkModal} okText='Confirm' closeIcon={true} {...modalProps}>
      <Title level={2} style={{ fontSize: '20px' }}>
        Create Voyage
      </Title>
      <Form form={form}>
        <Form.Item
          label='Remarks'
          name='remarks'
          rules={[
            {
              required: true,
              message: 'Please input the voyage remarks',
            },
          ]}
        >
          <Input placeholder='Reason for voyage...' />
        </Form.Item>
      </Form>
    </Modal>
  );
}
