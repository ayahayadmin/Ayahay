import { REPORTING_API } from '@ayahay/constants';
import {
  TripReport,
  TripManifest,
  PortsByShip,
  PerVesselReport,
  DashboardTrips,
} from '@ayahay/http';
import axios from '@ayahay/services/axios';
import { getPort, getPorts } from '@ayahay/services/port.service';
import { getShip, getShips } from '@ayahay/services/ship.service';

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
  const { data } = await axios.get<PortsByShip[]>(`${REPORTING_API}/ports`, {
    params: { startDate, endDate },
  });

  await fetchAssociatedEntitiesForReports(data);
  return data;
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

export async function fetchAssociatedEntitiesForReports(
  data: DashboardTrips[] | PortsByShip[]
): Promise<void> {
  // this ensures all ports and shipping lines are cached before a getById is called
  // without this, the parallel call to getById will all fetch getAll at the same time for N times
  await Promise.allSettled([getPorts(), getShips()]);
  await Promise.all(data.map((d) => fetchAssociatedEntitiesForReport(d)));
}

export async function fetchAssociatedEntitiesForReport(
  data: DashboardTrips | PortsByShip
): Promise<void> {
  const [srcPort, destPort, ship] = await Promise.allSettled([
    getPort(data.srcPortId),
    getPort(data.destPortId),
    getShip(data.shipId),
  ]);
  data.srcPort = srcPort.status === 'fulfilled' ? srcPort.value : undefined;
  data.destPort = destPort.status === 'fulfilled' ? destPort.value : undefined;
  data.ship = ship.status === 'fulfilled' ? ship.value : undefined;
}
