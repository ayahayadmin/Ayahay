import { forwardRef } from 'react';
import {
  Disbursement as IDisbursement,
  TripReport as ITripReport,
} from '@ayahay/http';
import {
  getFullDate,
  getLocaleTimeString,
} from '@ayahay/services/date.service';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Reports.module.scss';
import { three_columns_grid, two_columns_grid } from './DailySalesReport';
import { OPERATION_COSTS } from '@ayahay/constants';

interface ProfitAndLossStatementProps {
  data: ITripReport;
  vesselName: string;
  disbursements: IDisbursement[];
  expenses: any;
}

const ProfitAndLossStatement = forwardRef(function (
  { expenses, data, disbursements, vesselName }: ProfitAndLossStatementProps,
  ref
) {
  const { loggedInAccount } = useAuth();
  const user = loggedInAccount?.email;
  const date = getFullDate(new Date().toString(), true);

  let totalTicketCost = 0;
  let totalRefund = 0;
  let totalAdminFee = 0;
  let totalFare = 0;

  let totalVehicleTicketCost = 0;
  let totalVehicleAdminFee = 0;
  let totalVehicleRefund = 0;
  let totalVehicleFare = 0;

  let totalExpenses = 0;

  data.passengers.map((passenger) => {
    totalTicketCost += passenger.ticketCost;
    totalAdminFee += passenger.adminFee;
    totalFare += passenger.fare;
  });

  data.vehicles?.map((vehicle) => {
    totalVehicleTicketCost += vehicle.ticketCost;
    totalVehicleAdminFee += vehicle.adminFee;
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
            <p>VESSEL NAME: {vesselName}</p>
            <p>VOYAGE: {data.id}</p>
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
                <th>Voyage</th>
                <th>Description</th>
                <th>Total Sales</th>
                <th>Refund</th>
                <th>Net Sales</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{vesselName}</td>
                {/* will still discuss what if there are more than 1 teller in a trip */}
                <td>{data.passengers[0]?.teller}</td>
                <td>
                  {data.srcPort.code}-{data.destPort.code}/WT:&nbsp;
                  {getFullDate(data.departureDate, true)}
                  &nbsp;@&nbsp;
                  {getLocaleTimeString(data.departureDate)}
                </td>
                <td>PAX INCOME</td>
                <td>{totalTicketCost}</td>
                <td>-</td>
                <td>{totalTicketCost - totalRefund}</td>
              </tr>
              <tr>
                <td>{vesselName}</td>
                {/* will still discuss what if there are more than 1 teller in a trip */}
                <td>{data.passengers[0]?.teller}</td>
                <td>
                  {data.srcPort.code}-{data.destPort.code}/WT:&nbsp;
                  {getFullDate(data.departureDate, true)}
                  &nbsp;@&nbsp;
                  {getLocaleTimeString(data.departureDate)}
                </td>
                <td>CARGO INCOME</td>
                <td>{totalVehicleTicketCost}</td>
                <td>-</td>
                <td>{totalVehicleTicketCost - totalVehicleRefund}</td>
              </tr>
            </tbody>
            <tfoot style={{ backgroundColor: '#ddebf7' }}>
              <tr style={{ fontWeight: 'bold' }}>
                <td colSpan={4}>TOTAL SALES</td>
                <td>{totalTicketCost + totalVehicleTicketCost}</td>
                <td>-</td>
                {/* subtract here TOTAL refund (pax and cargo), but none for now */}
                <td>{totalTicketCost + totalVehicleTicketCost}</td>
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
                <th>Amount</th>
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
                    <td>{disbursement.amount}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot style={{ backgroundColor: '#ddebf7' }}>
              <tr style={{ fontWeight: 'bold' }}>
                <td colSpan={6}>TOTAL EXPENSES</td>
                <td>{totalExpenses}</td>
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
                  {totalTicketCost + totalVehicleTicketCost}
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
                        {expenses[expense]}
                      </div>
                    </td>
                  );
                })}
                <td style={{ verticalAlign: 'top', textAlign: 'right' }}>
                  {totalExpenses}
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
                  {totalTicketCost + totalVehicleTicketCost - totalExpenses}
                </td>
              </tr>
              <tr>
                <td>LIABILITY</td>
                <td>Ayahay Convenience Fee</td>
                <td style={{ textAlign: 'right' }}>
                  {totalAdminFee + totalVehicleAdminFee}
                </td>
              </tr>
              <tr style={{ fontWeight: 'bold' }}>
                <td>INCOME</td>
                <td>
                  {data.srcPort.code}-{data.destPort.code}/WT:&nbsp;
                  {getFullDate(data.departureDate, true)}
                  &nbsp;@&nbsp;
                  {getLocaleTimeString(data.departureDate)}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {totalFare + totalVehicleFare - totalExpenses}
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
