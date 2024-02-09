import { TripReport as ITripReport } from '@ayahay/http';
import {
  getFullDate,
  getLocaleTimeString,
} from '@ayahay/services/date.service';
import { useAuth } from '@/contexts/AuthContext';
import { forwardRef } from 'react';
import styles from './Reports.module.scss';
import { three_columns_grid, two_columns_grid } from './DailySalesReport';
import { MOPBreakdown } from './SummarySalesPerVessel';

interface CargoDailySalesReportProps {
  data: ITripReport;
  vesselName: string;
}

const CargoDailySalesReport = forwardRef(function (
  { data, vesselName }: CargoDailySalesReportProps,
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
  let totalSales = 0;

  data.vehicles?.map((vehicle) => {
    if (vehicle.paymentStatus === 'PayMongo') {
      mopBreakdown.Ayahay.aggFare += vehicle.ticketCost;
    } else {
      mopBreakdown.OTC.aggFare += vehicle.ticketCost;
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
                <th>Type of Vehicle</th>
                <th>BOL #</th>
                <th>Plate No.</th>
                <th>Total</th>
                <th>Freight Cost</th>
                <th>Total Sales</th>
              </tr>
            </thead>
            <tbody>
              {data.vehiclesBreakdown?.map((vehicleBreakdown) => {
                const totalVehiclesBooked =
                  vehicleBreakdown.vehiclesBooked.length;
                totalSales += vehicleBreakdown.totalSales;
                const firstRow = (
                  <tr>
                    <td>{vehicleBreakdown.typeOfVehicle}</td>
                    <td></td>
                    <td></td>
                    <td>{totalVehiclesBooked}</td>
                    <td>{vehicleBreakdown.baseFare}</td>
                    <td>{vehicleBreakdown.totalSales}</td>
                  </tr>
                );

                const vehicleList = vehicleBreakdown.vehiclesBooked.map(
                  (vehicle) => {
                    return (
                      <tr>
                        <td>{vehicleBreakdown.typeOfVehicle}</td>
                        <td>{vehicle.referenceNo}</td>
                        <td>{vehicle.plateNo}</td>
                      </tr>
                    );
                  }
                );

                return [firstRow, ...vehicleList];
              })}
            </tbody>
            <tfoot style={{ backgroundColor: '#ddebf7' }}>
              <tr style={{ fontWeight: 'bold' }}>
                <td colSpan={3}>TOTAL</td>
                <td>{totalVehicles}</td>
                <td></td>
                <td>{totalSales}</td>
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
                <td className={styles['cell-border']}>{totalSales}</td>
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

export default CargoDailySalesReport;
