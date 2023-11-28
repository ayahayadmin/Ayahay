import { FormInstance } from 'antd';
import {
  AdminSearchQuery,
  DashboardTrips,
  TripSearchByDateRange,
} from '@ayahay/http';
import axios from '@ayahay/services/axios';
import { SEARCH_API } from '@ayahay/constants';
import { getPort } from '@ayahay/services/port.service';
import { getShip } from '@ayahay/services/ship.service';
import dayjs from 'dayjs';
import { isEmpty } from 'lodash';

export function initializeAdminSearchFormFromQueryParams(
  form: FormInstance,
  params: { [p: string]: string }
) {
  form.setFieldsValue({
    cabinTypes: params.cabinTypes?.split(','),
  });
}

export function initializeRangePickerFormFromQueryParams(
  form: FormInstance,
  params: { [p: string]: string }
) {
  const startDate = !isEmpty(params)
    ? dayjs(params.startDate)
    : dayjs().startOf('day');
  const endDate = !isEmpty(params)
    ? dayjs(params.endDate)
    : dayjs().endOf('day');

  form.setFieldsValue({
    dateRange: [startDate, endDate],
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

export function buildUrlQueryParamsFromRangePickerForm(form: FormInstance) {
  if (form.getFieldValue('dateRange') === null) {
    return;
  }

  const searchQuery: Record<string, string> = {
    startDate: form.getFieldValue('dateRange')[0].startOf('day').toISOString(),
    endDate: form.getFieldValue('dateRange')[1].endOf('day').toISOString(),
  };

  return new URLSearchParams(searchQuery).toString();
}

export function buildSearchQueryFromRangePickerForm(
  form: FormInstance
): TripSearchByDateRange | undefined {
  if (form.getFieldValue('dateRange') === null) {
    return;
  }

  const searchQuery: TripSearchByDateRange = {
    startDate: form.getFieldValue('dateRange')[0].startOf('day').toISOString(),
    endDate: form.getFieldValue('dateRange')[1].endOf('day').toISOString(),
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
  return axios
    .get(`${SEARCH_API}/dashboard`, {
      params: {
        startDate,
        endDate,
      },
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
