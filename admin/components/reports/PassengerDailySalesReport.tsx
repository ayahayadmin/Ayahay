import { TripReport as ITripReport } from '@ayahay/http';
import {
  getFullDate,
  getLocaleTimeString,
} from '@ayahay/services/date.service';
import { useAuth } from '@/contexts/AuthContext';
import { forwardRef } from 'react';
import styles from './Reports.module.scss';
import { MOPBreakdown } from './SummarySalesPerVessel';

interface PassengerDailySalesReportProps {
  data: ITripReport;
  vesselName: string;
}

export const two_columns_grid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
};

export const three_columns_grid = {
  display: 'grid',
  gridAutoRows: '1fr',
  gridTemplateColumns: '1fr 1fr 1fr',
};

function padZeroes(num: any, size: number) {
  num = num.toString();
  while (num.length < size) num = '0' + num;
  return num;
}

const PassengerDailySalesReport = forwardRef(function (
  { data, vesselName }: PassengerDailySalesReportProps,
  ref
) {
  const { loggedInAccount } = useAuth();
  const user = loggedInAccount?.email;
  const date = getFullDate(new Date().toString(), true);

  const mopBreakdown: MOPBreakdown = {
    OTC: {
      aggFare: 0,
    },
    Ayahay: {
      aggFare: 0,
    },
  };

  let totalPassengers = data.passengers.length;
  let totalTicketCost = 0;

  return (
    <div ref={ref}>
      <div style={{ fontSize: 9, width: 842 }}>
        <div className={styles['center-div']}>
          <img src='/assets/ayahay-logo.png' alt={`Logo`} height={25} />
          <span
            style={{
              fontSize: 10,
              color: '#1f4e79',
              fontWeight: 'bold',
            }}
          >
            AYAHAY TECHNOLOGY CORP
          </span>
        </div>
        <div className={styles['font-style']} style={three_columns_grid}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <img src='/assets/aznar-logo.png' alt={`Logo`} height={50} />
            <span style={{ fontWeight: 'bold' }}>EB AZNAR SHIPPING</span>
          </div>
          <span className={styles['center-div']} style={{ fontWeight: 'bold' }}>
            PASSENGER DAILY SALES REPORT
          </span>
        </div>
        <div
          className={styles['font-style']}
          style={{
            ...two_columns_grid,
            padding: '0px 58px',
          }}
        >
          <div>
            <p>VESSEL NAME: {vesselName}</p>
            <p>VOYAGE: {data.voyageNumber}</p>
            <p>
              ROUTE: {data.srcPort.name} to {data.destPort.name}
            </p>
            <p>
              SCHEDULE:&nbsp;{getFullDate(data.departureDate, true)}&nbsp;
              {getLocaleTimeString(data.departureDate)}
            </p>
          </div>
          <div
            style={{
              marginLeft: 'auto',
              marginRight: 0,
            }}
          >
            <p>User: {user}</p>
            <p>Date Printed: {date}</p>
          </div>
        </div>

        <div
          className={`${styles['center-div']} ${styles['font-style']}`}
          style={{ marginTop: 15 }}
        >
          <table
            style={{
              width: '95%',
              borderCollapse: 'collapse',
              textAlign: 'center',
              fontSize: 8,
            }}
          >
            <thead style={{ backgroundColor: '#ddebf7' }}>
              <tr>
                <th>Vessel</th>
                <th>Outlet</th>
                <th>Teller</th>
                <th>Reference</th>
                <th>Voyage</th>
                <th>Accommodation</th>
                <th>Discount</th>
                <th>Ticket Cost</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {data.passengers.map((passenger, idx) => {
                totalTicketCost += passenger.ticketCost;
                const paymentStatus = passenger.paymentStatus;

                if (paymentStatus === 'PayMongo') {
                  mopBreakdown.Ayahay.aggFare += passenger.ticketCost;
                } else {
                  mopBreakdown.OTC.aggFare += passenger.ticketCost;
                }

                return (
                  <tr>
                    <td>{vesselName}</td>
                    <td>
                      {paymentStatus === 'PayMongo'
                        ? 'Ayahay'
                        : data.srcPort.name}
                    </td>
                    <td>{passenger.teller}</td>
                    <td>{padZeroes(idx + 1, 4)}</td>
                    <td>
                      {data.srcPort.code}-{data.destPort.code}/WT:&nbsp;
                      {getFullDate(data.departureDate, true)}
                      &nbsp;@&nbsp;
                      {getLocaleTimeString(data.departureDate)}
                    </td>
                    <td>{passenger.accommodation}</td>
                    <td>{passenger.discount}</td>
                    <td>{passenger.ticketCost}</td>
                    <td>{paymentStatus}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot style={{ backgroundColor: '#ddebf7' }}>
              <tr style={{ fontWeight: 'bold' }}>
                <td colSpan={6}>TOTAL</td>
                <td>{totalPassengers}</td>
                <td>{totalTicketCost}</td>
                <td>-</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div
          style={{
            ...two_columns_grid,
            marginTop: 15,
            paddingLeft: 22,
            paddingRight: 22,
          }}
        >
          <table
            style={{
              borderCollapse: 'collapse',
              textAlign: 'center',
              fontSize: 8,
            }}
          >
            <thead style={{ backgroundColor: '#ddebf7' }}>
              <tr style={{ fontWeight: 'bold' }}>
                <th className={styles['cell-border']}>Mode of Payment</th>
                <th className={styles['cell-border']}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(mopBreakdown).map((mop: string) => {
                return (
                  <tr>
                    <td className={styles['cell-border']}>{mop}</td>
                    <td className={styles['cell-border']}>
                      {mopBreakdown[mop as keyof MOPBreakdown].aggFare}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot style={{ backgroundColor: '#ddebf7' }}>
              <tr style={{ fontWeight: 'bold' }}>
                <td className={styles['cell-border']}>TOTAL SALES</td>
                <td className={styles['cell-border']}>{totalTicketCost}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div
          className={styles['font-style']}
          style={{ ...three_columns_grid, marginTop: 50 }}
        >
          <div className={styles['center-div']}>
            <span
              style={{
                borderTop: '1px solid black',
                padding: '0 60px',
              }}
            >
              CHECKED
            </span>
          </div>
          <div className={styles['center-div']}>
            <span
              style={{
                borderTop: '1px solid black',
                padding: '0 60px',
              }}
            >
              AUDITED
            </span>
          </div>
          <div className={styles['center-div']}>
            <span
              style={{
                borderTop: '1px solid black',
                padding: '0 60px',
              }}
            >
              APPROVED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default PassengerDailySalesReport;
