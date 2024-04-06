'use client';
import BillOfLading from '@/components/document/BillOfLading';
import { useEffect, useState } from 'react';
import {
  getBillOfLading,
  updateBookingFRR,
} from '@/services/reporting.service';
import { FloatButton, Form, Skeleton } from 'antd';
import { BillOfLading as IBillOfLading } from '@ayahay/http';
import { PrinterOutlined } from '@ant-design/icons';

export default function BillOfLadingPage({ params }: any) {
  const [data, setData] = useState<IBillOfLading[] | undefined>();
  const [form] = Form.useForm();
  const bookingId = params.id;

  useEffect(() => {
    fetchBillOfLading(bookingId);
  }, []);

  const fetchBillOfLading = async (bookingId: string): Promise<void> => {
    const billOfLading = await getBillOfLading(bookingId);
    const billOfLadingPerVehicle = billOfLading?.vehicles?.map(
      (vehicle) => ({ ...billOfLading, vehicles: [vehicle] } as IBillOfLading)
    );
    setData(billOfLadingPerVehicle);
  };

  const handleFRRSubmit = async (value: any) => {
    await updateBookingFRR(bookingId, value);
    window.location.reload();
  };

  return (
    <div>
      <Skeleton loading={data === undefined}>
        <Form form={form} onFinish={handleFRRSubmit}>
          {data &&
            data.map((billOfLadingPerVehicle) => (
              <BillOfLading data={billOfLadingPerVehicle} />
          ))}
        </Form>
      </Skeleton>

      <FloatButton
        className='hide-on-print'
        type='primary'
        onClick={() => window.print()}
        tooltip='Print'
        icon={<PrinterOutlined height={72} width={72} />}
      ></FloatButton>
    </div>
  );
}
