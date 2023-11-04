import { FormInstance } from 'antd';
import { AdminSearchQuery, DashboardTrips } from '@ayahay/http';
import axios from 'axios';
import { SEARCH_API } from '@ayahay/constants';
import { getPort } from '@ayahay/services/port.service';
import { getShip } from '@ayahay/services/ship.service';
import { getAuth } from 'firebase/auth';

export function initializeAdminSearchFormFromQueryParams(
  form: FormInstance,
  params: { [p: string]: string }
) {
  form.setFieldsValue({
    cabinTypes: params.cabinTypes?.split(','),
  });
}

export function buildUrlQueryParamsFromAdminSearchForm(
  form: FormInstance
): string {
  const searchQuery: Record<string, string> = {
    cabinTypes: form.getFieldValue('cabinTypes')?.toString(),
  };

  Object.keys(searchQuery).forEach((key) => {
    if (searchQuery[key] === undefined) {
      delete searchQuery[key];
    }
  });

  return new URLSearchParams(searchQuery).toString();
}

export function buildAdminSearchQueryFromSearchForm(
  form: FormInstance
): AdminSearchQuery {
  const searchQuery: AdminSearchQuery = {
    cabinTypes: form.getFieldValue('cabinTypes'),
  };

  return searchQuery;
}

export function getTime(date: string) {
  return new Date(date).toLocaleTimeString('en-US');
}

// Get Trip Information is for the Admin Dashboard
export async function getTripInformation(
  startDate: string,
  endDate: string
): Promise<DashboardTrips[] | undefined> {
  const authToken = await getAuth().currentUser?.getIdToken();

  // Every page refresh, fireabse token is undefined,
  // we set an if condition to prevent passing an undefined
  // token to the API (it'll cause an error)
  if (!authToken) {
    return;
  }

  return await axios
    .get(`${SEARCH_API}/trip-table`, {
      params: {
        startDate,
        endDate,
      },
      headers: { Authorization: `Bearer ${authToken}` },
    })
    .then((res) => {
      return Promise.all(
        res.data.map((data: DashboardTrips) => {
          return mapResponseData(data);
        })
      );
    })
    .then((res) => res);
}

function mapResponseData(responseData: DashboardTrips) {
  return Promise.allSettled([
    // For now we are just interested with Ports & Shipping Line. In the future we can add more like Ship
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
