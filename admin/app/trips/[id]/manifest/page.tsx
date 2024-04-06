'use client';

import React, { useEffect, useRef, useState } from 'react';
import { TripManifest as ITripManifest } from '@ayahay/http';
import TripManifest from '@/components/reports/TripManifest';
import { getTripManifest } from '@/services/reporting.service';
import { FloatButton, Skeleton } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { useAuthGuard } from '@/hooks/auth';
import { useAuth } from '@/contexts/AuthContext';

export default function TripManifestPage({ params }: any) {
  const { loggedInAccount } = useAuth();
  useAuthGuard(['Staff', 'SuperAdmin', 'Admin']);

  const manifestRef = useRef();
  const [manifest, setManifest] = useState<ITripManifest | undefined>();

  useEffect(() => {
    if (loggedInAccount === null) {
      return;
    }
    const tripId = params.id;
    fetchManifest(tripId);
  }, [loggedInAccount]);

  const fetchManifest = async (tripId: number): Promise<void> => {
    setManifest(await getTripManifest(tripId));
  };

  return (
    <div style={{ padding: '32px' }} ref={manifestRef}>
      <Skeleton loading={manifest === undefined}>
        {manifest && <TripManifest manifest={manifest} />}
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
