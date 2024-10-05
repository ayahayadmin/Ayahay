import { PORTS_API, SHIPPING_LINE_API } from '@ayahay/constants';
import { IPort } from '@ayahay/models';
import axios from './axios';
import { cacheItem, fetchItem } from './cache.service';

export async function getPorts(): Promise<IPort[] | undefined> {
  const cachedPorts = fetchItem<IPort[]>('ports');
  if (cachedPorts !== undefined) {
    return cachedPorts;
  }

  // If white label, only get the ports of the specific shipping line
  const shippingLineId = process.env.NEXT_PUBLIC_SHIPPING_LINE_ID;
  try {
    let ports;

    if (shippingLineId === undefined) {
      const { data } = await axios.get(PORTS_API);
      ports = data;
    } else {
      const { data } = await axios.get(
        `${SHIPPING_LINE_API}/${shippingLineId}/ports`
      );
      ports = data;
    }

    cacheItem('ports', ports, 60 * 24 * 7);
    return ports;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export async function getPort(portId: number): Promise<IPort> {
  const ports = await getPorts();
  return ports?.find((port) => port.id === portId)!;
}
