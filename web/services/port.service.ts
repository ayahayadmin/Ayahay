import { PORTS_API } from '@ayahay/constants';
import { IPort } from '@ayahay/models/port.model';
import axios from 'axios';
import dayjs from 'dayjs';
import { isWithinTimeInterval, removeCache } from './utils';

export function getPortsMock(): IPort[] {
  const portNames = [
    'Bacolod',
    'Batangas',
    'Baybay, Leyte',
    'Bogo, Cebu',
    'Bato, Leyte',
    'Butuan',
    'Cagayan de Oro',
    'Calapan',
    'Calbayog City',
    'Caticlan',
    'Cebu',
    'Consuelo, Camotes',
    'Danao',
    'Dapitan',
    'Dapdap',
    'Dumaguete',
    'Dipolog',
    'Dapa, Siargao',
    'EB MagaIona, Negros Occidental',
    'Estancia',
    'Getafe',
    'Guimaras',
    'Hagnaya',
    'Iligan',
    'Iloilo',
    'Isabel, Leyte',
    'Jagna, Bohol',
    'Medellin, Cebu',
    'Larena, Siquijor',
    'Cataingan, Masbate',
    'Masbate',
    'Matnog',
    'Manila',
    'Nasipit',
    'Odiongan, Romblon',
    'Ormoc',
    'Ozamiz',
    'Ozamiz',
    'Palompon',
    'Plaridel',
    'Puerto Princesa, Palawan',
    'Puerto Galera',
    'Romblon, Romblon',
    'Roxas City, Capiz',
    'Roxas, Mindoro',
    'San Carlos, Negros',
    'Sibuyan, Romblon',
    'Siquijor',
    'Santa Fe, Bantayan Island',
    'Surigao',
    'Tagbilaran City, Bohol',
    'Talibon',
    'Toledo',
    'Tubigon',
    'Ubay, Bohol',
    'Zamboanqa',
  ] as string[];

  return portNames.map((name, id) => {
    return { id, name } as IPort;
  });
}

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
