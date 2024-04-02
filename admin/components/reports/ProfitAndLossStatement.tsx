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
import { OPERATION_COSTS } from '@ayahay/constants';
import { IDisbursement } from '@ayahay/models';
import { roundToTwoDecimalPlacesAndAddCommas } from '@/services/reporting.service';

interface ProfitAndLossStatementProps {
  data: ITripReport;
  disbursements: IDisbursement[];
  expenses: any;
}

const ProfitAndLossStatement = forwardRef(function (
  { expenses, data, disbursements }: ProfitAndLossStatementProps,
  ref
) {
  const { loggedInAccount } = useAuth();
  const user = loggedInAccount?.email;
  const date = getFullDate(new Date().toString(), true);

  let totalTicketCost = 0;
  let totalRefund = 0;
  let totalFare = 0;

  let totalVehicleTicketCost = 0;
  let totalVehicleRefund = 0;
  let totalVehicleFare = 0;

  let totalExpenses = 0;

  data.passengers.map((passenger) => {
    totalTicketCost += passenger.ticketCost;
    totalFare += passenger.fare;
  });

  data.vehicles?.map((vehicle) => {
    totalVehicleTicketCost += vehicle.ticketCost;
    totalVehicleFare += vehicle.fare;
  });

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
            PROFIT AND LOSS STATEMENT
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
                <th>Teller</th>
                <th>Description</th>
                <th>Total Sales</th>
                <th>Refund</th>
                <th>Net Sales</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{data.shipName}</td>
                {/* will still discuss what if there are more than 1 teller in a trip */}
                <td>{data.passengers[0]?.teller}</td>
                <td>PAX INCOME</td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(totalTicketCost)}
                </td>
                <td>-</td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(
                    totalTicketCost - totalRefund
                  )}
                </td>
              </tr>
              <tr>
                <td>{data.shipName}</td>
                {/* will still discuss what if there are more than 1 teller in a trip */}
                <td>{data.passengers[0]?.teller}</td>
                <td>CARGO INCOME</td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(totalVehicleTicketCost)}
                </td>
                <td>-</td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(totalVehicleTicketCost)}
                </td>
              </tr>
            </tbody>
            <tfoot style={{ backgroundColor: '#ddebf7' }}>
              <tr style={{ fontWeight: 'bold' }}>
                <td colSpan={3}>TOTAL SALES</td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(
                    totalTicketCost + totalVehicleTicketCost
                  )}
                </td>
                <td>-</td>
                {/* subtract here TOTAL refund (pax and cargo), but none for now */}
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(
                    totalTicketCost + totalVehicleTicketCost
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div
          className={`${styles['center-div']} ${styles['font-style']}`}
          style={{ marginTop: 10 }}
        >
          <table
            style={{
              width: '95%',
              borderCollapse: 'collapse',
              textAlign: 'center',
              fontSize: 8,
              tableLayout: 'fixed',
            }}
          >
            <caption style={{ textAlign: 'left' }}>DISBURSEMENT</caption>
            <thead style={{ backgroundColor: '#ddebf7' }}>
              <tr>
                <th>Date</th>
                <th>Teller</th>
                <th>Official Receipt</th>
                <th>Paid To</th>
                <th>Description</th>
                <th>Purpose</th>
                <th style={{ textAlign: 'left' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {disbursements.map((disbursement) => {
                totalExpenses += disbursement.amount;
                return (
                  <tr>
                    <td>{getFullDate(disbursement.date)}</td>
                    {/* TODO: will still discuss what if there are more than 1 teller in a trip */}
                    <td>{data.passengers[0]?.teller}</td>
                    <td className={styles['td-text-wrap']}>
                      {disbursement.officialReceipt}
                    </td>
                    <td className={styles['td-text-wrap']}>
                      {disbursement.paidTo}
                    </td>
                    <td className={styles['td-text-wrap']}>
                      {
                        OPERATION_COSTS[
                          disbursement.description as keyof typeof OPERATION_COSTS
                        ]
                      }
                    </td>
                    <td className={styles['td-text-wrap']}>
                      {disbursement.purpose}
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      PHP&nbsp;
                      {roundToTwoDecimalPlacesAndAddCommas(disbursement.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot style={{ backgroundColor: '#ddebf7' }}>
              <tr style={{ fontWeight: 'bold' }}>
                <td colSpan={6}>TOTAL EXPENSES</td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;{roundToTwoDecimalPlacesAndAddCommas(totalExpenses)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div
          className={`${styles['center-div']} ${styles['font-style']}`}
          style={{ marginTop: 10 }}
        >
          <table
            style={{
              width: '60%',
              borderCollapse: 'collapse',
              fontSize: 8,
            }}
          >
            <caption style={{ textAlign: 'left', fontWeight: 'bold' }}>
              SUMMARY
            </caption>
            <tbody>
              <tr>
                <td>TOTAL SALES</td>
                <td>
                  {data.srcPort.code}-{data.destPort.code}/WT:&nbsp;
                  {getFullDate(data.departureDate, true)}
                  &nbsp;@&nbsp;
                  {getLocaleTimeString(data.departureDate)}
                </td>
                {/* subtract here TOTAL refund (pax and cargo), but none for now */}
                <td style={{ textAlign: 'right' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(
                    totalTicketCost + totalVehicleTicketCost
                  )}
                </td>
              </tr>
              <tr>
                <td>LESS: Refund</td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td style={{ verticalAlign: 'top' }}>EXPENSES</td>
                {Object.keys(expenses).map((expense) => {
                  return (
                    <td style={two_columns_grid}>
                      <div>
                        {
                          OPERATION_COSTS[
                            expense as keyof typeof OPERATION_COSTS
                          ]
                        }
                      </div>
                      <div style={{ textAlign: 'right', maxWidth: 50 }}>
                        PHP&nbsp;
                        {roundToTwoDecimalPlacesAndAddCommas(expenses[expense])}
                      </div>
                    </td>
                  );
                })}
                <td style={{ verticalAlign: 'top', textAlign: 'right' }}>
                  PHP&nbsp;{roundToTwoDecimalPlacesAndAddCommas(totalExpenses)}
                </td>
              </tr>
              <tr>
                <td>NET SALES</td>
                <td>
                  {data.srcPort.code}-{data.destPort.code}/WT:&nbsp;
                  {getFullDate(data.departureDate, true)}
                  &nbsp;@&nbsp;
                  {getLocaleTimeString(data.departureDate)}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {/* subtract here TOTAL refund (pax and cargo), but none for now */}
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(
                    totalTicketCost + totalVehicleTicketCost - totalExpenses
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

export default ProfitAndLossStatement;
