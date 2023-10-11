import { PORTS_API } from '@ayahay/constants';
import { IPort } from '@ayahay/models';
import axios from 'axios';
import { cacheItem, fetchItem } from './cache.service';

export async function getPorts(): Promise<IPort[] | undefined> {
  const cachedPorts = fetchItem<IPort[]>('ports');
  if (cachedPorts !== undefined) {
    return cachedPorts;
  }

  try {
    const { data } = await axios.get(`${PORTS_API}`);
    cacheItem('ports', data);
    return data;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export async function getPort(portId: number): Promise<IPort> {
  const ports = await getPorts();
  return ports?.find((port) => port.id === portId)!;
}
