import { IPassenger } from '@ayahay/models/passenger.model';
import {
  Button,
  Checkbox,
  Form,
  Input,
  Modal,
  ModalProps,
  Typography,
} from 'antd';
import React, { useState } from 'react';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import { useForm } from 'antd/es/form/Form';

const { Title } = Typography;

interface AddCompanionsModalProps {
  onConfirmCancellation: (cancellationReason: string) => void;
}

export default function BookingCancellationModal({
  onConfirmCancellation,
  onOk,
  ...modalProps
}: AddCompanionsModalProps & ModalProps) {
  const [form] = useForm();

  const onOkModal = async () => {
    try {
      await form.validateFields(['remarks']);
      onConfirmCancellation(form.getFieldValue('remarks'));
    } catch {}
  };

  return (
    <Modal onOk={onOkModal} okText='Void' closeIcon={true} {...modalProps}>
      <Title level={2} style={{ fontSize: '20px' }}>
        Are you sure you want to void this booking? This action cannot be
        undone.
      </Title>
      <Form form={form}>
        <Form.Item
          label='Remarks'
          name='remarks'
          rules={[
            {
              required: true,
              message: 'Please input the cancellation remarks',
            },
          ]}
        >
          <Input placeholder='Cancellation, change of mind, processed mistakenly, etc.' />
        </Form.Item>
      </Form>
    </Modal>
  );
}
