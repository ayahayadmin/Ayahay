import { Form } from 'antd';
import Trip from '@/common/models/trip.model';

interface CreateBookingFormProps {
  trip?: Trip;
}

export default function CreateBookingForm({ trip }: CreateBookingFormProps) {
  const [form] = Form.useForm();
  return <Form form={form}></Form>;
}
