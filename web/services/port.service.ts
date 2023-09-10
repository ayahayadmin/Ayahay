import { PORTS_API } from '@ayahay/constants';
import { IPort } from '@ayahay/models/port.model';
import axios from 'axios';
import dayjs from 'dayjs';
import { isWithinTimeInterval, removeCache } from './utils';

export async function getPorts(): Promise<IPort[]> {
  const portsJson = localStorage.getItem('ports');
  if (portsJson === undefined || portsJson === null) {
    const { data } = await axios.get(`${PORTS_API}`);
    localStorage.setItem('ports', JSON.stringify({ data, timestamp: dayjs() }));
    return data;
  }

  const { data, timestamp } = JSON.parse(portsJson);
  if (!isWithinTimeInterval(timestamp)) {
    removeCache('ports');
    //re-fetch ports?
  }
  return data;
}

export async function getPort(portId: number): Promise<IPort | undefined> {
  const ports = await getPorts();
  return ports.find((port) => port.id === portId);
}
