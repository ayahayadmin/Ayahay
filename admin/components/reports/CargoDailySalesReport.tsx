import { TripReport as ITripReport } from '@ayahay/http';
import {
  getFullDate,
  getLocaleTimeString,
} from '@ayahay/services/date.service';
import { useAuth } from '@/contexts/AuthContext';
import { forwardRef } from 'react';
import styles from './Reports.module.scss';
import {
  three_columns_grid,
  two_columns_grid,
} from './PassengerDailySalesReport';
import { MOPBreakdown } from './SummarySalesPerVessel';
import { roundToTwoDecimalPlacesAndAddCommas } from '@/services/reporting.service';

interface CargoDailySalesReportProps {
  data: ITripReport;
}

const CargoDailySalesReport = forwardRef(function (
  { data }: CargoDailySalesReportProps,
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

  let totalVehicles = data.vehicles?.length;
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
            CARGO DAILY SALES REPORT
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
            <p>VESSEL NAME: {data.shipName}</p>
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
                <th>Teller</th>
                <th>BOL #</th>
                <th>Vehicle Type</th>
                <th>Plate #</th>
                <th style={{ textAlign: 'left' }}>Discount</th>
                <th style={{ textAlign: 'left' }}>Ticket Cost</th>
                <th>Payment Method</th>
                <th>Collect</th>
              </tr>
            </thead>
            <tbody>
              {data.vehicles.map((vehicle) => {
                totalTicketCost += vehicle.ticketCost;
                const paymentStatus = vehicle.paymentStatus;

                if (paymentStatus === 'PayMongo') {
                  mopBreakdown.Ayahay.aggFare += vehicle.ticketCost;
                } else {
                  mopBreakdown.OTC.aggFare += vehicle.ticketCost;
                }

                const discountAmount = vehicle.discountAmount
                  ? `PHP ${roundToTwoDecimalPlacesAndAddCommas(
                      vehicle.discountAmount
                    )}`
                  : '';

                return (
                  <tr>
                    <td>{vehicle.teller}</td>
                    <td>{vehicle.referenceNo}</td>
                    <td>{vehicle.typeOfVehicle}</td>
                    <td>{vehicle.plateNo}</td>
                    <td style={{ textAlign: 'left' }}>{discountAmount}</td>
                    <td style={{ textAlign: 'left' }}>
                      PHP&nbsp;
                      {roundToTwoDecimalPlacesAndAddCommas(vehicle.ticketCost)}
                    </td>
                    <td>{paymentStatus}</td>
                    <td>{vehicle.collect ? 'Yes' : ''}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot style={{ backgroundColor: '#ddebf7' }}>
              <tr style={{ fontWeight: 'bold' }}>
                <td colSpan={3}>TOTAL</td>
                <td>{totalVehicles}</td>
                <td style={{ textAlign: 'left' }}>-</td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(totalTicketCost)}
                </td>
                <td>-</td>
                <td>-</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div
          className={`${styles['three-uneven-columns-grid']} ${styles['font-style']}`}
          style={{
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
              maxHeight: 10,
            }}
          >
            <thead style={{ backgroundColor: '#ddebf7' }}>
              <tr>
                <th
                  className={styles['header-border']}
                  style={{ borderLeft: '0.001px solid black' }}
                >
                  Mode of Payment
                </th>
                <th className={styles['header-border']}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(mopBreakdown).map((mop: string) => {
                return (
                  <tr>
                    <td
                      className={styles['cell-border']}
                      style={{ borderLeft: '0.001px solid black' }}
                    >
                      {mop}
                    </td>
                    <td className={styles['cell-border']}>
                      <div className={styles['wrap']}>
                        <div style={{ textAlign: 'left' }}>
                          PHP&nbsp;
                          {roundToTwoDecimalPlacesAndAddCommas(
                            mopBreakdown[mop as keyof MOPBreakdown].aggFare
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot style={{ backgroundColor: '#ddebf7' }}>
              <tr style={{ fontWeight: 'bold' }}>
                <td
                  className={styles['cell-border']}
                  style={{ borderLeft: '0.001px solid black' }}
                >
                  TOTAL SALES
                </td>
                <td className={styles['cell-border']}>
                  <div className={styles['wrap']}>
                    <div style={{ textAlign: 'left' }}>
                      PHP&nbsp;
                      {roundToTwoDecimalPlacesAndAddCommas(totalTicketCost)}
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>

          <div></div>

          <table
            style={{
              borderCollapse: 'collapse',
              textAlign: 'center',
              fontSize: 8,
            }}
          >
            <thead style={{ backgroundColor: '#ddebf7' }}>
              <tr>
                <th
                  className={styles['header-border']}
                  style={{ borderLeft: '0.001px solid black' }}
                >
                  Vehicle Type
                </th>
                <th className={styles['header-border']}>Total</th>
                <th className={styles['header-border']}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.vehicleTypesBreakdown?.map((vehicleType) => {
                return (
                  <tr>
                    <td
                      className={styles['cell-border']}
                      style={{ borderLeft: '0.001px solid black' }}
                    >
                      {vehicleType.typeOfVehicle}
                    </td>
                    <td className={styles['cell-border']}>
                      {vehicleType.totalBooked}
                    </td>
                    <td className={styles['cell-border']}>
                      <div className={styles['wrap']}>
                        <div style={{ textAlign: 'left' }}>
                          PHP&nbsp;
                          {roundToTwoDecimalPlacesAndAddCommas(
                            vehicleType.totalSales
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
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

export default CargoDailySalesReport;
