'use client';
import BillOfLading from '@/components/document/BillOfLading';
import { useEffect, useState } from 'react';
import { getBillOfLading } from '@/services/reporting.service';
import { FloatButton, Skeleton } from 'antd';
import { BillOfLading as IBillOfLading } from '@ayahay/http';
import { PrinterOutlined } from '@ant-design/icons';

export default function BillOfLadingPage({ params }: any) {
  const [data, setData] = useState<IBillOfLading | undefined>();

  useEffect(() => {
    const bookingId = params.id;
    fetchBillOfLading(bookingId);
  }, []);

  const fetchBillOfLading = async (bookingId: string): Promise<void> => {
    setData(await getBillOfLading(bookingId));
  };

  return (
    <div>
      <Skeleton loading={data === undefined}>
        {data && <BillOfLading data={data} />}
      </Skeleton>

      <FloatButton
        className='hide-on-print'
        type='primary'
        onClick={() => window.print()}
        tooltip='Print'
        icon={<PrinterOutlined rev={undefined} height={72} width={72} />}
      ></FloatButton>
    </div>
  );
}
