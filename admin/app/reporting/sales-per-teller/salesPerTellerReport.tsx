'use client';
import SalesPerTeller from '@/components/reports/SalesPerTeller';
import { useAuth } from '@/contexts/AuthContext';
import { getSalesPerTeller } from '@/services/reporting.service';
import { DownloadOutlined } from '@ant-design/icons';
import {
  SalesPerTellerReport as ISalesPerTeller,
  TripSearchByDateRange,
} from '@ayahay/http';
import { Button } from 'antd';
import jsPDF from 'jspdf';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface SalesPerTellerReportProps {
  searchQuery: TripSearchByDateRange | undefined;
}

export default function SalesPerTellerReport({
  searchQuery,
}: SalesPerTellerReportProps) {
  const { loggedInAccount } = useAuth();
  const [data, setData] = useState<ISalesPerTeller | undefined>();
  const searchParams = useSearchParams();
  const params = Object.fromEntries(searchParams.entries());
  const salesPerTellerRef = useRef();

  useEffect(() => {
    fetchSalesPerTellerData();
  }, [loggedInAccount, searchQuery]);

  const fetchSalesPerTellerData = async () => {
    setData(await getSalesPerTeller(searchQuery));
  };

  const handleDownloadSalesPerTeller = async () => {
    const doc = new jsPDF('l', 'pt', 'a4', true);
    const fileName = 'sales-per-teller';

    doc.html(salesPerTellerRef.current, {
      async callback(doc) {
        await doc.save(fileName);
      },
      margin: [25, 0, 25, 0],
    });
  };

  return (
    <div>
      <Button
        type='primary'
        htmlType='submit'
        loading={!data}
        onClick={handleDownloadSalesPerTeller}
      >
        <DownloadOutlined /> Download
      </Button>
      <div style={{ display: 'none' }}>
        {data && (
          <SalesPerTeller
            data={data}
            startDate={params.startDate}
            endDate={params.endDate}
            ref={salesPerTellerRef}
          />
        )}
      </div>
    </div>
  );
}
