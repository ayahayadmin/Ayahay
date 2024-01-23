import { ITrip } from '@ayahay/models';
import { getPort, getPorts } from './port.service';
import { getShippingLine, getShippingLines } from './shipping-line.service';

export async function fetchAssociatedEntitiesToTrips(
  trips: ITrip[]
): Promise<void> {
  // this ensures all ports and shipping lines are cached before a getById is called
  // without this, the parallel call to getById will all fetch getAll at the same time for N times
  await Promise.allSettled([getPorts(), getShippingLines()]);
  await Promise.all(trips.map((trip) => fetchAssociatedEntitiesToTrip(trip)));
}

export async function fetchAssociatedEntitiesToTrip(
  trip: ITrip
): Promise<void> {
  const [srcPort, destPort, shippingLine] = await Promise.allSettled([
    getPort(trip.srcPortId),
    getPort(trip.destPortId),
    getShippingLine(trip.shippingLineId),
  ]);
  trip.srcPort = srcPort.status === 'fulfilled' ? srcPort.value : undefined;
  trip.destPort = destPort.status === 'fulfilled' ? destPort.value : undefined;
  trip.shippingLine =
    shippingLine.status === 'fulfilled' ? shippingLine.value : undefined;
}
