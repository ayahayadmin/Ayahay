import { forwardRef } from 'react';
import { TripReport as ITripReport } from '@ayahay/http';
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
import { MOPBreakdown } from './SummarySalesPerVessel';
import { roundToTwoDecimalPlacesAndAddCommas } from '@/services/reporting.service';
import { IDisbursement } from '@ayahay/models';
import { sumBy } from 'lodash';

interface SummarySalesPerVoyageProps {
  data: ITripReport;
  status: string;
  disbursements: IDisbursement[];
}

const SummarySalesPerVoyage = forwardRef(function (
  { data, status, disbursements }: SummarySalesPerVoyageProps,
  ref
) {
  const { loggedInAccount } = useAuth();
  const user = loggedInAccount?.email;
  const date = getFullDate(new Date().toString(), true);

  const mopBreakdown: MOPBreakdown = {
    OTC: {
      aggTicketCost: 0,
      aggFare: 0,
    },
    Agency: {
      aggTicketCost: 0,
      aggFare: 0,
    },
    Online: {
      aggTicketCost: 0,
      aggFare: 0,
    },
  };

  let totalPassengers = data.passengers.length;
  let totalPassengerSales = 0;
  let totalPassengerRefund = 0;
  let totalPassengerNetSales = 0;

  data.passengers.map((passenger) => {
    totalPassengerSales += passenger.ticketSale;
    totalPassengerRefund += passenger.refundAmount;
    totalPassengerNetSales += passenger.ticketCost;

    if (passenger.paymentStatus === 'Online') {
      mopBreakdown.Online.aggTicketCost! += passenger.ticketCost;
      mopBreakdown.Online.aggFare += passenger.fare;
    } else if (passenger.paymentStatus === 'Agency') {
      mopBreakdown.Agency.aggTicketCost! += passenger.ticketCost;
      mopBreakdown.Agency.aggFare += passenger.fare;
    } else {
      mopBreakdown.OTC.aggTicketCost! += passenger.ticketCost;
      mopBreakdown.OTC.aggFare += passenger.fare;
    }
  });

  let totalVehicles = data.vehicles?.length;
  let totalVehicleSales = 0;
  let totalVehicleRefund = 0;
  let totalVehicleNetSales = 0;

  data.vehicles?.map((vehicle) => {
    totalVehicleSales += vehicle.ticketSale;
    totalVehicleRefund += vehicle.refundAmount;
    totalVehicleNetSales += vehicle.ticketCost;

    if (vehicle.paymentStatus === 'Online') {
      mopBreakdown.Online.aggTicketCost! += vehicle.ticketCost;
      mopBreakdown.Online.aggFare += vehicle.fare;
    } else if (vehicle.paymentStatus === 'Agency') {
      mopBreakdown.Agency.aggTicketCost! += vehicle.ticketCost;
      mopBreakdown.Agency.aggFare += vehicle.fare;
    } else {
      mopBreakdown.OTC.aggTicketCost! += vehicle.ticketCost;
      mopBreakdown.OTC.aggFare += vehicle.fare;
    }
  });

  const totalDisbursements = sumBy(disbursements, 'amount');

  return (
    <div ref={ref}>
      <div style={{ fontSize: 9, width: 842 }}>
        <div className={styles['center-div']}>
          <img src='/assets/ayahay-logo.png' height={25} />
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
            <img
              src={`/assets/shipping-line-logos/${data.shippingLine.name}.png`}
              height={50}
            />
            <span style={{ fontWeight: 'bold' }}>{data.shippingLine.name}</span>
          </div>
          <span className={styles['center-div']} style={{ fontWeight: 'bold' }}>
            SUMMARY SALES PER VOYAGE REPORT
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
              SCHEDULE: {getFullDate(data.departureDate, true)}&nbsp;
              {getLocaleTimeString(data.departureDate)}
            </p>
            <p>STATUS: {status}</p>
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
                <th>Total Passengers</th>
                <th>Total Vehicles</th>
                <th style={{ textAlign: 'left' }}>Total Sales</th>
                <th style={{ textAlign: 'left' }}>Refund</th>
                <th style={{ textAlign: 'left' }}>Net Sales</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{data.shipName}</td>
                <td>{totalPassengers}</td>
                <td></td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(totalPassengerSales)}
                </td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(totalPassengerRefund)}
                </td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(totalPassengerNetSales)}
                </td>
              </tr>
              <tr>
                <td>{data.shipName}</td>
                <td></td>
                <td>{totalVehicles}</td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(totalVehicleSales)}
                </td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(totalVehicleRefund)}
                </td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(totalVehicleNetSales)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          className={styles['font-style']}
          style={{ ...two_columns_grid, marginTop: 25, paddingLeft: 22 }}
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
                <th
                  className={styles['header-border']}
                  style={{ borderLeft: '0.001px solid black' }}
                >
                  Mode of Payment
                </th>
                <th className={styles['header-border']}>Fare</th>
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
                            mopBreakdown[mop as keyof MOPBreakdown]
                              .aggTicketCost ?? 0
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
                      {roundToTwoDecimalPlacesAndAddCommas(
                        totalPassengerNetSales + totalVehicleNetSales
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>

          <table
            style={{
              width: '50%',
              borderCollapse: 'collapse',
              fontSize: 8,
              marginLeft: 'auto',
            }}
          >
            <tbody>
              <tr>
                <td style={{ textAlign: 'left', width: '50%' }}>
                  Total Passenger Sales
                </td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(totalPassengerNetSales)}
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: 'left', width: '50%' }}>
                  Total Cargo Sales
                </td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(totalVehicleNetSales)}
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: 'left', width: '50%' }}>
                  Total Disbursements
                </td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;-
                  {roundToTwoDecimalPlacesAndAddCommas(totalDisbursements)}
                </td>
              </tr>
              <tr style={{ fontWeight: 'bold' }}>
                <td style={{ textAlign: 'left', width: '50%' }}>TOTAL</td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(
                    totalPassengerNetSales +
                      totalVehicleNetSales -
                      totalDisbursements
                  )}
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

export default SummarySalesPerVoyage;
