'use client';
import React, { useEffect, useRef, useState } from 'react';
import { TripReport as ITripReport } from '@ayahay/http';
import {
  computeExpenses,
  getTripsReporting,
} from '@/services/reporting.service';
import { Button, Select, Typography } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useAuthGuard } from '@/hooks/auth';
import { useAuth } from '@/contexts/AuthContext';
import PassengerDailySalesReport from '@/components/reports/PassengerDailySalesReport';
import jsPDF from 'jspdf';
import SummarySalesPerVoyage from '@/components/reports/SummarySalesPerVoyage';
import ProfitAndLossStatement from '@/components/reports/ProfitAndLossStatement';
import CargoDailySalesReport from '@/components/reports/CargoDailySalesReport';
import { IDisbursement, IShip } from '@ayahay/models';
import { getShips } from '@ayahay/services/ship.service';
import { getDisbursements } from '@/services/disbursement.service';

const { Title } = Typography;

enum STATUS {
  ON_TIME = 'ON TIME',
  LATE = 'LATE',
}

export default function TripReportingPage({ params }: any) {
  useAuthGuard(['Staff', 'Admin', 'SuperAdmin']);
  const { loggedInAccount } = useAuth();
  const dailySalesReportRef = useRef();
  const cargoDailySalesReportRef = useRef();
  const summarySalesPerVoyageRef = useRef();
  const profitAndLossStatementRef = useRef();
  const [ships, setShips] = useState<IShip[] | undefined>();
  const [tripsReporting, setTripsReporting] = useState<
    ITripReport | undefined
  >();
  const [vesselName, setVesselName] = useState<string | undefined>();
  const [status, setStatus] = useState(STATUS.ON_TIME);
  const [disbursements, setDisbursements] = useState<
    IDisbursement[] | undefined
  >(undefined);
  const [expenses, setExpenses] = useState();

  useEffect(() => {
    if (loggedInAccount === null) {
      return;
    }
    const tripId = params.id;
    fetchTripsReporting(tripId);
    fetchShips();
    fetchDisbursements(tripId);
  }, [loggedInAccount]);

  const fetchTripsReporting = async (tripId: number): Promise<void> => {
    setTripsReporting(await getTripsReporting(tripId));
  };

  const fetchShips = async (): Promise<void> => {
    setShips(await getShips());
  };

  const fetchDisbursements = async (tripId: number) => {
    const disbursements = await getDisbursements(tripId);
    const computedExpenses = computeExpenses(disbursements);
    setExpenses(computedExpenses);
    setDisbursements(disbursements);
  };

  const handleStatusChange = (value: string) => {
    setStatus(STATUS[value as keyof typeof STATUS]);
  };

  const handleVesselNameChange = (value: string) => {
    setVesselName(value);
  };

  const handleDownloadDailySales = async () => {
    const doc = new jsPDF('l', 'pt', 'a4', true);
    doc.html(dailySalesReportRef.current, {
      async callback(doc) {
        await doc.save('passenger-daily-sales-report');
      },
      margin: [25, 0, 25, 0],
    });
  };

  const handleDownloadCargoDailySales = async () => {
    const doc = new jsPDF('l', 'pt', 'a4', true);
    doc.html(cargoDailySalesReportRef.current, {
      async callback(doc) {
        await doc.save('cargo-daily-sales-report');
      },
      margin: [25, 0, 25, 0],
    });
  };

  const handleDownloadSummarySalesPerVoyage = async () => {
    const doc = new jsPDF('l', 'pt', 'a4', true);
    doc.html(summarySalesPerVoyageRef.current, {
      async callback(doc) {
        await doc.save('summary-sales-per-voyage');
      },
      margin: [25, 0, 25, 0],
    });
  };

  const handleDownloadProfitAndLossStatement = async () => {
    const doc = new jsPDF('l', 'pt', 'a4', true);
    doc.html(profitAndLossStatementRef.current, {
      async callback(doc) {
        await doc.save('profit-and-loss-statement');
      },
      margin: [25, 0, 25, 0],
    });
  };

  return (
    <div style={{ padding: '32px' }}>
      Vessel Name:&nbsp;
      <Select
        options={ships?.map((ship) => ({
          value: ship.name,
          label: ship.name,
        }))}
        onChange={handleVesselNameChange}
        style={{ minWidth: '20%' }}
      />
      <Title level={1} style={{ fontSize: 25 }}>
        Passenger Daily Sales Report
      </Title>
      <Button
        type='primary'
        htmlType='submit'
        loading={tripsReporting === undefined}
        disabled={vesselName === undefined}
        onClick={handleDownloadDailySales}
      >
        <DownloadOutlined rev={undefined} /> Download
      </Button>
      <div style={{ display: 'none' }}>
        {tripsReporting && vesselName && (
          <PassengerDailySalesReport
            data={tripsReporting}
            vesselName={vesselName}
            ref={dailySalesReportRef}
          />
        )}
      </div>
      <Title level={1} style={{ fontSize: 25 }}>
        Cargo Daily Sales Report
      </Title>
      <Button
        type='primary'
        htmlType='submit'
        loading={tripsReporting === undefined}
        disabled={vesselName === undefined}
        onClick={handleDownloadCargoDailySales}
      >
        <DownloadOutlined rev={undefined} /> Download
      </Button>
      <div style={{ display: 'none' }}>
        {tripsReporting && vesselName && (
          <CargoDailySalesReport
            data={tripsReporting}
            vesselName={vesselName}
            ref={cargoDailySalesReportRef}
          />
        )}
      </div>
      <Title level={1} style={{ fontSize: 25 }}>
        Summary Sales Per Voyage
      </Title>
      <div>
        Status:&nbsp;
        <Select
          options={Object.keys(STATUS).map((enumKey) => ({
            value: enumKey,
            label: STATUS[enumKey as keyof typeof STATUS],
          }))}
          onChange={handleStatusChange}
          defaultValue={STATUS.ON_TIME}
          style={{ minWidth: '20%' }}
        />
      </div>
      <Button
        type='primary'
        htmlType='submit'
        loading={tripsReporting === undefined || disbursements === undefined}
        disabled={vesselName === undefined}
        onClick={handleDownloadSummarySalesPerVoyage}
      >
        <DownloadOutlined rev={undefined} /> Download
      </Button>
      <div style={{ display: 'none' }}>
        {tripsReporting && vesselName && disbursements && (
          <SummarySalesPerVoyage
            data={tripsReporting}
            status={status}
            vesselName={vesselName}
            disbursements={disbursements}
            ref={summarySalesPerVoyageRef}
          />
        )}
      </div>
      <Title level={1} style={{ fontSize: 25 }}>
        Profit and Loss Statement
      </Title>
      <Button
        type='primary'
        htmlType='submit'
        loading={
          tripsReporting === undefined ||
          (disbursements === undefined && expenses === undefined)
        }
        disabled={vesselName === undefined}
        onClick={handleDownloadProfitAndLossStatement}
      >
        <DownloadOutlined rev={undefined} /> Download
      </Button>
      <div style={{ display: 'none' }}>
        {tripsReporting && vesselName && disbursements && expenses && (
          <ProfitAndLossStatement
            data={tripsReporting}
            vesselName={vesselName}
            disbursements={disbursements}
            expenses={expenses}
            ref={profitAndLossStatementRef}
          />
        )}
      </div>
    </div>
  );
}
