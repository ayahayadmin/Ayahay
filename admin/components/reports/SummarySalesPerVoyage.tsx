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

interface SummarySalesPerVoyageProps {
  data: ITripReport;
  status: string;
  vesselName: string;
}

const SummarySalesPerVoyage = forwardRef(function (
  { data, status, vesselName }: SummarySalesPerVoyageProps,
  ref
) {
  const { loggedInAccount } = useAuth();
  const user = loggedInAccount?.email;
  const date = getFullDate(new Date().toString(), true);

  const mopBreakdown: MOPBreakdown = {
    OTC: {
      aggTicketCost: 0,
      aggAdminFee: 0,
      aggFare: 0,
    },
    Ayahay: {
      aggTicketCost: 0,
      aggAdminFee: 0,
      aggFare: 0,
    },
  };

  let totalPassengers = data.passengers.length;
  let totalPassengerSales = 0;
  let totalPassengerRefund = 0;
  let totalPassengerAdminFee = 0;
  let totalPassengerFare = 0;

  data.passengers.map((passenger) => {
    totalPassengerSales += passenger.ticketCost;
    totalPassengerAdminFee += passenger.adminFee;
    totalPassengerFare += passenger.fare;

    if (passenger.paymentStatus === 'PayMongo') {
      mopBreakdown.Ayahay.aggTicketCost! += passenger.ticketCost;
      mopBreakdown.Ayahay.aggAdminFee! += passenger.adminFee;
      mopBreakdown.Ayahay.aggFare += passenger.fare;
    } else {
      mopBreakdown.OTC.aggTicketCost! += passenger.ticketCost;
      mopBreakdown.OTC.aggAdminFee! += passenger.adminFee;
      mopBreakdown.OTC.aggFare += passenger.fare;
    }
  });

  let totalVehicles = data.vehicles?.length;
  let totalVehicleSales = 0;
  let totalVehicleRefund = 0;
  let totalVehicleAdminFee = 0;
  let totalVehicleFare = 0;

  data.vehicles?.map((vehicle) => {
    totalVehicleSales += vehicle.ticketCost;
    totalVehicleAdminFee += vehicle.adminFee;
    totalVehicleFare += vehicle.fare;

    if (vehicle.paymentStatus === 'PayMongo') {
      mopBreakdown.Ayahay.aggTicketCost! += vehicle.ticketCost;
      mopBreakdown.Ayahay.aggAdminFee! += vehicle.adminFee;
      mopBreakdown.Ayahay.aggFare += vehicle.fare;
    } else {
      mopBreakdown.OTC.aggTicketCost! += vehicle.ticketCost;
      mopBreakdown.OTC.aggAdminFee! += vehicle.adminFee;
      mopBreakdown.OTC.aggFare += vehicle.fare;
    }
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
            <p>VESSEL NAME: {vesselName}</p>
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
                <th>Voyage</th>
                <th>Total Passengers</th>
                <th>Total Vehicles</th>
                <th>Total Sales</th>
                <th>Refund</th>
                <th>Net Sales</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{vesselName}</td>
                <td>
                  {data.srcPort.code}-{data.destPort.code}/WT:&nbsp;
                  {getFullDate(data.departureDate, true)}
                  &nbsp;@&nbsp;
                  {getLocaleTimeString(data.departureDate)}
                </td>
                <td>{totalPassengers}</td>
                <td></td>
                <td>{totalPassengerSales}</td>
                <td>-</td>
                <td>{totalPassengerSales - totalPassengerRefund}</td>
              </tr>
              <tr>
                <td>{vesselName}</td>
                <td>
                  {data.srcPort.code}-{data.destPort.code}/WT:&nbsp;
                  {getFullDate(data.departureDate, true)}
                  &nbsp;@&nbsp;
                  {getLocaleTimeString(data.departureDate)}
                </td>
                <td></td>
                <td>{totalVehicles}</td>
                <td>{totalVehicleSales}</td>
                <td>-</td>
                <td>{totalVehicleSales - totalVehicleRefund}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ ...two_columns_grid, marginTop: 25, paddingLeft: 22 }}>
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
                <th className={styles['cell-border']}>Fare</th>
                {/* <th className={styles['cell-border']}>
                  Ayahay Convenience Fee
                </th>
                <th className={styles['cell-border']}>Amount</th> */}
              </tr>
            </thead>
            <tbody>
              {Object.keys(mopBreakdown).map((mop: string) => {
                return (
                  <tr>
                    <td className={styles['cell-border']}>{mop}</td>
                    <td className={styles['cell-border']}>
                      {mopBreakdown[mop as keyof MOPBreakdown].aggTicketCost}
                    </td>
                    {/* <td className={styles['cell-border']}>
                      {mopBreakdown[mop as keyof MOPBreakdown].aggAdminFee}
                    </td>
                    <td className={styles['cell-border']}>
                      {mopBreakdown[mop as keyof MOPBreakdown].aggFare}
                    </td> */}
                  </tr>
                );
              })}
            </tbody>
            <tfoot style={{ backgroundColor: '#ddebf7' }}>
              <tr style={{ fontWeight: 'bold' }}>
                <td className={styles['cell-border']}>TOTAL SALES</td>
                <td className={styles['cell-border']}>
                  {totalPassengerSales + totalVehicleSales}
                </td>
                {/* <td className={styles['cell-border']}>
                  {totalPassengerAdminFee + totalVehicleAdminFee}
                </td> */}
                {/* <td className={styles['cell-border']}>
                  {totalPassengerFare + totalVehicleFare}
                </td> */}
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

export default SummarySalesPerVoyage;
