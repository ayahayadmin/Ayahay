import { REPORTING_API } from '@ayahay/constants';
import {
  TripReport,
  TripManifest,
  PortsByShip,
  PerVesselReport,
} from '@ayahay/http';
import axios from '@ayahay/services/axios';
import { getPort } from '@ayahay/services/port.service';
import { getShip } from '@ayahay/services/ship.service';

export async function getTripsReporting(
  tripId: number
): Promise<TripReport | undefined> {
  try {
    const { data } = await axios.get(
      `${REPORTING_API}/trips/${tripId}/reporting`
    );
    return data;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export async function getPortsByShip(
  startDate: string,
  endDate: string
): Promise<PortsByShip[] | undefined> {
  try {
    const data = await axios
      .get(`${REPORTING_API}/ports`, {
        params: { startDate, endDate },
      })
      .then((res) => {
        return Promise.all(
          res.data.map((data: PortsByShip) => {
            return mapResponseData(data);
          })
        );
      })
      .then((res) => res);
    return data;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export async function getTripsByShip({
  shipId,
  srcPortId,
  destPortId,
  startDate,
  endDate,
}: PortsByShip): Promise<PerVesselReport[] | undefined> {
  try {
    const { data } = await axios.get(`${REPORTING_API}/trips/ships`, {
      params: { shipId, srcPortId, destPortId, startDate, endDate },
    });
    return data;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export async function getTripManifest(
  tripId: number
): Promise<TripManifest | undefined> {
  try {
    const { data } = await axios.get(
      `${REPORTING_API}/trips/${tripId}/manifest`
    );
    return data;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export function computeExpenses(disbursements: any[] | undefined) {
  if (disbursements === undefined) {
    return 0;
  }

  let expenses: any = {};
  disbursements.forEach(({ amount, description }) => {
    if (expenses.hasOwnProperty(description)) {
      expenses[description] += amount;
    } else {
      expenses[description] = amount;
    }
  });

  return expenses;
}

function mapResponseData(responseData: PortsByShip) {
  return Promise.allSettled([
    getPort(responseData.srcPortId),
    getPort(responseData.destPortId),
    getShip(responseData.shipId),
  ]).then(([srcPort, destPort, ship]) => {
    return {
      ...responseData,
      srcPort: srcPort.status === 'fulfilled' ? srcPort.value : '',
      destPort: destPort.status === 'fulfilled' ? destPort.value : '',
      ship: ship.status === 'fulfilled' ? ship.value : '',
    };
  });
}
