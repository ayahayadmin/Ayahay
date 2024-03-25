'use client';
import { useAuthGuard } from '@/hooks/auth';
import { Button, Typography } from 'antd';
import { useRef } from 'react';
import styles from '../page.module.scss';
import { DownloadOutlined } from '@ant-design/icons';
import jsPDF from 'jspdf';
import SummarySalesPerVessel from '@/components/reports/SummarySalesPerVessel';
import { useShipReportingFromSearchParams } from '@/hooks/reporting';
import { useSearchParams } from 'next/navigation';

const { Title } = Typography;

export default function ReportingPage() {
  useAuthGuard(['Staff', 'Admin', 'SuperAdmin']);
  const searchParams = useSearchParams();
  const params = Object.fromEntries(searchParams.entries());
  const { data } = useShipReportingFromSearchParams(params);
  const summarySalesPerVesselRef = useRef();

  const handleDownloadSummarySalesPerVessel = async () => {
    const doc = new jsPDF('l', 'pt', 'a4', true);
    doc.html(summarySalesPerVesselRef.current, {
      async callback(doc) {
        await doc.save('summary-sales-per-vessel');
      },
      margin: [25, 0, 25, 0],
    });
  };

  return (
    <div className={styles['main-container']}>
      <Title level={1} style={{ fontSize: 25 }}>
        Summary Sales Per Vessel
      </Title>
      <Button
        type='primary'
        htmlType='submit'
        loading={data === undefined}
        onClick={handleDownloadSummarySalesPerVessel}
      >
        <DownloadOutlined rev={undefined} /> Download
      </Button>
      <div style={{ display: 'none' }}>
        {data && (
          <SummarySalesPerVessel
            data={data}
            startDate={params.startDate}
            endDate={params.endDate}
            reportType={params.reportType}
            ref={summarySalesPerVesselRef}
          />
        )}
      </div>
    </div>
  );
}
