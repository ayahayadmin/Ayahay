import {
  Checkbox,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  ModalProps,
  Typography,
} from 'antd';
import { useForm } from 'antd/es/form/Form';
import { IVoucher } from '@ayahay/models';
import { InfoCircleOutlined } from '@ant-design/icons';
import React from 'react';
import dayjs from 'dayjs';
import { buildVoucherFromCreateVoucherForm } from '@/services/voucher.service';

interface CreateVoucherModalProps {
  onCreateVoucher: (voucher: IVoucher) => Promise<void>;
}

const { Title } = Typography;

export default function CreateVoucherModal({
  onCreateVoucher,
  onOk,
  ...modalProps
}: CreateVoucherModalProps & ModalProps) {
  const [form] = useForm();

  const onOkModal = async () => {
    try {
      await form.validateFields();
      const voucher = buildVoucherFromCreateVoucherForm(form);
      await onCreateVoucher(voucher);
    } catch {}
  };

  return (
    <Modal onOk={onOkModal} okText='Confirm' closeIcon={true} {...modalProps}>
      <Title level={2} style={{ fontSize: '20px', marginBottom: '20px' }}>
        Create Voucher
      </Title>
      <Form
        form={form}
        initialValues={{
          discountFlat: 0,
          discountPercent: 0,
          canBookOnline: true,
        }}
        layout='vertical'
      >
        <Form.Item
          label='Code'
          name='code'
          colon={false}
          tooltip={{
            title: 'If left blank, a code will be auto-generated by the system',
            icon: <InfoCircleOutlined />,
          }}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label='Description'
          name='description'
          colon={false}
          rules={[{ required: true, message: 'Please input a description' }]}
        >
          <Input placeholder='20% off for all bookings' />
        </Form.Item>
        <Form.Item
          label='Flat Discount'
          name='discountFlat'
          colon={false}
          rules={[{ required: true, message: 'Please input a valid number' }]}
        >
          <InputNumber min={0} addonBefore='₱' controls={false} />
        </Form.Item>
        <Form.Item
          label='Percentage Discount'
          name='discountPercent'
          colon={false}
          rules={[{ required: true, message: 'Please input a valid number' }]}
        >
          <InputNumber min={0} max={100} addonAfter='%' controls={false} />
        </Form.Item>
        <Form.Item
          label='Expiry'
          name='expiry'
          colon={false}
          rules={[
            { required: true, message: 'Please input the voucher expiry' },
          ]}
        >
          <DatePicker
            presets={[
              { label: 'Tomorrow', value: dayjs().add(1, 'd') },
              { label: 'Next Week', value: dayjs().add(7, 'd') },
              { label: 'Next Month', value: dayjs().add(1, 'month') },
              { label: 'Next Year', value: dayjs().add(1, 'year') },
            ]}
          />
        </Form.Item>
        <Form.Item
          label='Number of Uses'
          name='numberOfUses'
          colon={false}
          rules={[{ type: 'integer', message: 'Please input a whole number' }]}
          tooltip={{
            title:
              'If left blank, the voucher can be used unlimited times until the expiry date',
            icon: <InfoCircleOutlined />,
          }}
        >
          <InputNumber min={0} addonAfter='time(s)' controls={false} />
        </Form.Item>
        <Form.Item name='canBookOnline' valuePropName='checked'>
          <Checkbox>Available for Online Booking</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
}
