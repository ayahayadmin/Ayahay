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
import { first, sum } from 'lodash';
import { roundToTwoDecimalPlacesAndAddCommas } from '@/services/reporting.service';

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

  let totalPaxSales = 0;
  let totalPaxBooked = 0;
  let totalPaxFare = 0;

  let totalVehicleSales = 0;
  let totalVehicleBooked = 0;
  let totalVehicleFare = 0;

  let totalDisbursements = 0;

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
            {reportType === undefined
              ? 'SUMMARY SALES PER TRIP REPORT'
              : 'SUMMARY SALES PER VESSEL REPORT'}
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
            <caption style={{ textAlign: 'left' }}>PASSENGERS</caption>
            <thead style={{ backgroundColor: '#ddebf7' }}>
              <tr>
                <th>Voyage</th>
                <th>Discount Type</th>
                <th style={{ textAlign: 'left' }}>Total</th>
                <th style={{ textAlign: 'left' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.map((shipData) => {
                if (
                  shipData.passengers.length === 0 &&
                  shipData.passengerDiscountsBreakdown?.length === 0
                ) {
                  return;
                }

                shipData.passengers.map((passenger: any) => {
                  totalPaxFare += passenger.ticketCost;
                  if (passenger.paymentStatus === 'PayMongo') {
                    mopBreakdown.Ayahay.aggFare += passenger.ticketCost;
                  } else {
                    mopBreakdown.OTC.aggFare += passenger.ticketCost;
                  }
                });

                totalDisbursements += shipData.totalDisbursements;
                const voyage = `${getFullDate(
                  shipData.departureDate,
                  true
                )} @ ${getLocaleTimeString(shipData.departureDate)} (Voyage: ${
                  shipData.voyageNumber ?? '__'
                })`;
                let paxSales = 0;

                const discountTypeBreakdown: any =
                  shipData.passengerDiscountsBreakdown?.map(
                    (passengerDiscount, idx) => {
                      paxSales += passengerDiscount.totalSales;
                      return (
                        <tr>
                          {idx === 0 ? (
                            <td>
                              {reportType === undefined
                                ? voyage
                                : `${shipData.srcPort.code} to ${shipData.destPort.code} ${voyage}`}
                            </td>
                          ) : (
                            <td></td>
                          )}
                          <td>{passengerDiscount.typeOfDiscount}</td>
                          <td style={{ textAlign: 'left' }}>
                            {passengerDiscount.totalBooked}
                          </td>
                          <td style={{ textAlign: 'left' }}>
                            PHP&nbsp;
                            {roundToTwoDecimalPlacesAndAddCommas(
                              passengerDiscount.totalSales
                            )}
                          </td>
                        </tr>
                      );
                    }
                  );

                const subTotalRow = (
                  <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td style={{ textAlign: 'left' }}>
                      PHP&nbsp;
                      {roundToTwoDecimalPlacesAndAddCommas(paxSales)}
                    </td>
                  </tr>
                );

                totalPaxBooked += shipData.totalPassengers;
                totalPaxSales += paxSales;

                return [...discountTypeBreakdown, subTotalRow];
              })}
            </tbody>
            <tfoot style={{ backgroundColor: '#ddebf7' }}>
              <tr>
                <td colSpan={2}>TOTAL</td>
                <td style={{ textAlign: 'left' }}>{totalPaxBooked}</td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(totalPaxSales)}
                </td>
              </tr>
            </tfoot>
          </table>
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
            <caption style={{ textAlign: 'left' }}>CARGOES</caption>
            <thead style={{ backgroundColor: '#ddebf7' }}>
              <tr>
                <th>Voyage</th>
                <th>Vehicle Type</th>
                <th style={{ textAlign: 'left' }}>Total</th>
                <th style={{ textAlign: 'left' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.map((shipData) => {
                if (
                  shipData.vehicles.length === 0 &&
                  shipData.vehicleTypesBreakdown?.length === 0
                ) {
                  return;
                }

                shipData.vehicles.map((vehicle: any) => {
                  totalVehicleFare += vehicle.ticketCost;
                  if (vehicle.paymentStatus === 'PayMongo') {
                    mopBreakdown.Ayahay.aggFare += vehicle.ticketCost;
                  } else {
                    mopBreakdown.OTC.aggFare += vehicle.ticketCost;
                  }
                });

                const voyage = `${getFullDate(
                  shipData.departureDate,
                  true
                )} @ ${getLocaleTimeString(shipData.departureDate)} (Voyage: ${
                  shipData.voyageNumber ?? '__'
                })`;
                let vehicleSales = 0;

                const vehicleTypeBreakdown: any =
                  shipData.vehicleTypesBreakdown?.map((vehicle, idx) => {
                    vehicleSales += vehicle.totalSales;
                    return (
                      <tr>
                        {idx === 0 ? (
                          <td>
                            {reportType === undefined
                              ? voyage
                              : `${shipData.srcPort.code} to ${shipData.destPort.code} ${voyage}`}
                          </td>
                        ) : (
                          <td></td>
                        )}
                        <td>{vehicle.typeOfVehicle}</td>
                        <td style={{ textAlign: 'left' }}>
                          {vehicle.totalBooked}
                        </td>
                        <td style={{ textAlign: 'left' }}>
                          PHP&nbsp;
                          {roundToTwoDecimalPlacesAndAddCommas(
                            vehicle.totalSales
                          )}
                        </td>
                      </tr>
                    );
                  });

                const subTotalRow = (
                  <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td style={{ textAlign: 'left' }}>
                      PHP&nbsp;
                      {roundToTwoDecimalPlacesAndAddCommas(vehicleSales)}
                    </td>
                  </tr>
                );

                totalVehicleBooked += shipData.totalVehicles;
                totalVehicleSales += vehicleSales;

                return [...vehicleTypeBreakdown, subTotalRow];
              })}
            </tbody>
            <tfoot style={{ backgroundColor: '#ddebf7' }}>
              <tr>
                <td colSpan={2}>TOTAL</td>
                <td style={{ textAlign: 'left' }}>{totalVehicleBooked}</td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(totalVehicleSales)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div
          className={styles['font-style']}
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
                      {roundToTwoDecimalPlacesAndAddCommas(
                        sum([totalPaxFare, totalVehicleFare])
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
              marginRight: 4,
            }}
          >
            <tbody>
              <tr>
                <td style={{ textAlign: 'left', width: '50%' }}>
                  Total Passenger Sales
                </td>
                <td style={{ textAlign: 'right' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(totalPaxSales)}
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: 'left', width: '50%' }}>
                  Total Cargo Sales
                </td>
                <td style={{ textAlign: 'right' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(totalVehicleSales)}
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: 'left', width: '50%' }}>
                  Total Disbursements
                </td>
                <td style={{ textAlign: 'right' }}>
                  PHP&nbsp;-
                  {roundToTwoDecimalPlacesAndAddCommas(totalDisbursements)}
                </td>
              </tr>
              <tr style={{ fontWeight: 'bold' }}>
                <td style={{ textAlign: 'left', width: '50%' }}>TOTAL SALES</td>
                <td style={{ textAlign: 'right' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(
                    sum([totalPaxSales, totalVehicleSales, -totalDisbursements])
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

export default SummarySalesPerVessel;
