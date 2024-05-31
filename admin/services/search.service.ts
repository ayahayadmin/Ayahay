import { FormInstance } from 'antd';
import {
  DashboardTrips,
  PaginatedRequest,
  PaginatedResponse,
  PortsAndDateRangeSearch,
  TripSearchByDateRange,
} from '@ayahay/http';
import axios from '@ayahay/services/axios';
import { SEARCH_API } from '@ayahay/constants';
import dayjs from 'dayjs';
import { isEmpty } from 'lodash';
import { fetchAssociatedEntitiesForReports } from './reporting.service';

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

export function initializePortsAndDateRangeFromQueryParams(
  form: FormInstance,
  params: { [p: string]: string }
): void {
  const startDate = !isEmpty(params)
    ? dayjs(params.startDate)
    : dayjs().startOf('day');
  const endDate = !isEmpty(params)
    ? dayjs(params.endDate)
    : dayjs().endOf('day');

  form.setFieldsValue({
    dateRange: [startDate, endDate],
    srcPortId: params.srcPortId ? +params.srcPortId : undefined,
    destPortId: params.destPortId ? +params.destPortId : undefined,
  });
}

export function buildUrlQueryParamsFromRangePickerForm(
  form: FormInstance
): string | undefined {
  if (form.getFieldValue('dateRange') === null) {
    return;
  }

  const searchQuery: Record<string, string> = {
    startDate: form.getFieldValue('dateRange')[0].startOf('day').toISOString(),
    endDate: form.getFieldValue('dateRange')[1].endOf('day').toISOString(),
  };

  return new URLSearchParams(searchQuery).toString();
}

export function buildUrlQueryParamsFromPortsAndDateRange(
  form: FormInstance
): string | undefined {
  if (form.getFieldValue('dateRange') === null) {
    return;
  }

  const searchQuery: Record<string, string> = {
    startDate: form.getFieldValue('dateRange')[0].startOf('day').toISOString(),
    endDate: form.getFieldValue('dateRange')[1].endOf('day').toISOString(),
    srcPortId: form.getFieldValue('srcPortId')?.toString(),
    destPortId: form.getFieldValue('destPortId')?.toString(),
  };

  Object.keys(searchQuery).forEach((key) => {
    if (searchQuery[key] === undefined) {
      delete searchQuery[key];
    }
  });

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

export function buildSearchQueryFromPortsAndDateRange(
  form: FormInstance
): PortsAndDateRangeSearch | undefined {
  if (form.getFieldValue('dateRange') === null) {
    return;
  }

  const searchQuery: any = {
    startDate: form.getFieldValue('dateRange')[0].startOf('day').toISOString(),
    endDate: form.getFieldValue('dateRange')[1].endOf('day').toISOString(),
    srcPortId: form.getFieldValue('srcPortId'),
    destPortId: form.getFieldValue('destPortId'),
  };

  return searchQuery;
}

export function getTime(date: string) {
  return new Date(date).toLocaleTimeString('en-US');
}

// Get Trip Information is for the Admin Dashboard
export async function getDashboardTrips(
  shippingLineId: number | undefined,
  searchQuery: PortsAndDateRangeSearch | undefined,
  pagination: PaginatedRequest
): Promise<PaginatedResponse<DashboardTrips> | undefined> {
  if (isEmpty(searchQuery) || shippingLineId === undefined) {
    return;
  }

  const query = new URLSearchParams({
    shippingLineId,
    ...searchQuery,
    ...pagination,
  } as any).toString();

  try {
    const { data: dashboardTrips } = await axios.get<
      PaginatedResponse<DashboardTrips>
    >(`${SEARCH_API}/dashboard?${query}`);

    await fetchAssociatedEntitiesForReports(dashboardTrips.data);
    return dashboardTrips;
  } catch (e) {
    console.error(e);
  }
}
