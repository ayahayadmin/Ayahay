import { PORTS_API } from '@ayahay/constants';
import { IPort } from '@ayahay/models/port.model';
import axios from 'axios';
import dayjs from 'dayjs';
import { isWithinTimeInterval } from './utils';

async function fetchAndCachePorts(): Promise<IPort[]> {
  const { data } = await axios.get(`${PORTS_API}`);
  localStorage.setItem('ports', JSON.stringify({ data, timestamp: dayjs() }));
  return data;
}

export async function getPorts(): Promise<IPort[]> {
  const portsJson = localStorage.getItem('ports');
  if (portsJson === undefined || portsJson === null) {
    return await fetchAndCachePorts();
  }

  const { data, timestamp } = JSON.parse(portsJson);
  if (!isWithinTimeInterval(timestamp)) {
    return await fetchAndCachePorts();
  }
  return data;
}

export async function getPort(portId: number): Promise<IPort> {
  const ports = await getPorts();
  return ports.find((port) => port.id === portId)!;
}
