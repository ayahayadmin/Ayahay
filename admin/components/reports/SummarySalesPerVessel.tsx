import { forwardRef } from 'react';
import { PerVesselReport as IPerVesselReport } from '@ayahay/http';
import {
  getFullDate,
  getLocaleTimeString,
} from '@ayahay/services/date.service';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Reports.module.scss';
import {
  three_columns_grid,
  two_columns_grid,
} from './PassengerDailySalesReport';
import { first, sum, sumBy } from 'lodash';

interface SummarySalesPerVoyageProps {
  data: IPerVesselReport[];
  startDate: string;
  endDate: string;
  reportType?: string;
}

export interface MOPBreakdown {
  OTC: {
    aggTicketCost?: number;
    aggAdminFee?: number;
    aggFare: number;
  };
  Ayahay: {
    aggTicketCost?: number;
    aggAdminFee?: number;
    aggFare: number;
  };
}

const SummarySalesPerVessel = forwardRef(function (
  { data, startDate, endDate, reportType }: SummarySalesPerVoyageProps,
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

  let totalSalesArr: number[] = [];
  let totalBoardedArr: number[] = [];
  let totalAdminFeeArr: number[] = [];
  let totalFare = 0;

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
            SUMMARY SALES PER VESSEL REPORT
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
            <p>VESSEL NAME: {first(data)?.shipName}</p>
            {reportType === undefined && (
              <p>
                ROUTE: {first(data)?.srcPort.name} to&nbsp;
                {first(data)?.destPort.name}
              </p>
            )}
            <p>
              SCHEDULE: {getFullDate(startDate, true)} to&nbsp;
              {getFullDate(endDate, true)}
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
                <th>Voyage</th>
                <th>Accommodation</th>
                <th>Model</th>
                <th>Class</th>
                <th>Ticket Amount</th>
                <th>Board</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {data.map((shipData) => {
                shipData.passengers?.map((passenger: any) => {
                  totalFare += passenger.ticketCost;
                  if (passenger.paymentStatus === 'PayMongo') {
                    mopBreakdown.Ayahay.aggFare += passenger.ticketCost;
                  } else {
                    mopBreakdown.OTC.aggFare += passenger.ticketCost;
                  }
                });

                const voyage = `${getFullDate(
                  shipData.departureDate,
                  true
                )} @ ${getLocaleTimeString(shipData.departureDate)} (Voyage: ${
                  shipData.voyageNumber
                })`;
                const boarded = shipData.totalBoardedPassengers;
                const total = sumBy(
                  shipData.breakdown.cabinPassengerBreakdown,
                  'total'
                );
                let totalSales = 0;
                const vesselBreakdown =
                  shipData.breakdown.cabinPassengerBreakdown.map(
                    (cabinPassenger) => {
                      totalSales += cabinPassenger.total;
                      return (
                        <tr>
                          <td></td>
                          <td>{cabinPassenger.accommodation}</td>
                          <td>REGULAR</td>
                          <td>{cabinPassenger.discountType}</td>
                          <td>{cabinPassenger.ticketCost}</td>
                          <td>{cabinPassenger.boarded}</td>
                          <td>{cabinPassenger.total}</td>
                        </tr>
                      );
                    }
                  );

                const noShowRow = shipData.breakdown.noShowBreakdown.map(
                  (noShow) => {
                    totalSales += noShow.total;
                    return (
                      <tr>
                        <td></td>
                        <td>NO SHOW</td>
                        <td>REGULAR</td>
                        <td>{noShow.discountType}</td>
                        <td>{noShow.ticketCost}</td>
                        <td>{noShow.count}</td>
                        <td>{noShow.total}</td>
                      </tr>
                    );
                  }
                );

                const firstRow = (
                  <tr style={{ fontWeight: 'bold' }}>
                    <td>{voyage}</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>{boarded}</td>
                    <td>{total}</td>
                  </tr>
                );
                totalBoardedArr.push(boarded);

                const totalSalesRow = (
                  <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>{totalSales}</td>
                  </tr>
                );
                totalSalesArr.push(totalSales);

                const totalPassengersWithAdminFee = sumBy(
                  shipData.breakdown.cabinPassengerBreakdown,
                  'passengersWithAdminFee'
                );
                const totalAdminFee = totalPassengersWithAdminFee * 50;
                const ayahayConvenienceFeeRow = (
                  <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>Ayahay Convenience Fee</td>
                    <td>50</td>
                    <td>{totalPassengersWithAdminFee}</td>
                    <td>{totalAdminFee}</td>
                  </tr>
                );
                totalAdminFeeArr.push(totalAdminFee);

                return [
                  firstRow,
                  ...vesselBreakdown,
                  ...noShowRow,
                  totalSalesRow,
                  ayahayConvenienceFeeRow,
                ];
              })}
            </tbody>
            <tfoot style={{ backgroundColor: '#ddebf7' }}>
              <tr>
                <td colSpan={5}>OVERALL TOTAL</td>
                <td>{sum(totalBoardedArr)}</td>
                <td>{sum([...totalSalesArr, ...totalAdminFeeArr])}</td>
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
                <td className={styles['cell-border']}>{totalFare}</td>
              </tr>
            </tfoot>
          </table>

          <table
            style={{
              width: '45%',
              borderCollapse: 'collapse',
              fontSize: 8,
              marginLeft: 'auto',
              marginRight: 4,
            }}
          >
            <tbody>
              <tr>
                <td style={{ textAlign: 'left', width: '50%' }}>Ticket Cost</td>
                <td style={{ textAlign: 'right' }}>{sum(totalSalesArr)}</td>
                <td></td>
              </tr>
              <tr>
                <td style={{ textAlign: 'left', width: '50%' }}>
                  Ayahay Convenience Fee
                </td>
                <td style={{ textAlign: 'right' }}>{sum(totalAdminFeeArr)}</td>
                <td></td>
              </tr>
              <tr style={{ fontWeight: 'bold' }}>
                <td style={{ textAlign: 'left', width: '50%' }}>TOTAL SALES</td>
                <td></td>
                <td style={{ textAlign: 'right' }}>
                  {sum([...totalSalesArr, ...totalAdminFeeArr])}
                </td>
              </tr>
            </tbody>
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

export default SummarySalesPerVessel;
