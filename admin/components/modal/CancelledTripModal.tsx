import { Button, Form, Input, Modal, ModalProps } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { NotificationInstance } from 'antd/es/notification/interface';
import { useState } from 'react';

interface CancelledTripModalProps {
  tripId: number;
  setTripAsCancelled: (tripId: number, reason: string) => Promise<void>;
  setIsModalOpen: any;
  api: NotificationInstance;
}

export default function CancelledTripModal({
  tripId,
  setTripAsCancelled,
  setIsModalOpen,
  api,
  ...modalProps
}: CancelledTripModalProps & ModalProps) {
  const [form] = useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async () => {
    setLoading(true);
    try {
      await form.validateFields(['reason']);
      await setTripAsCancelled(tripId, form.getFieldValue('reason'));
      api.success({
        message: 'Set Status Cancelled',
        description:
          'The status of the selected trip has been set to Cancelled.',
      });
      setIsModalOpen(false);
      window.location.reload();
    } catch {
      api.error({
        message: 'Set Status Failed',
        description: 'Something went wrong.',
      });
    }
    setLoading(false);
  };

  return (
    <Modal
      title='Cancellation Reason'
      closeIcon={false}
      footer={null}
      {...modalProps}
    >
      <Form form={form} onFinish={onFinish}>
        <Form.Item
          label='Reason'
          name='reason'
          rules={[
            {
              required: true,
              message: 'Please input cancellation reason',
            },
          ]}
        >
          <Input placeholder='Reason for trip cancellation...' />
        </Form.Item>
        <Form.Item>
          <Button onClick={() => setIsModalOpen(false)}>Back</Button>
          <Button type='primary' htmlType='submit' loading={loading}>
            Send
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
