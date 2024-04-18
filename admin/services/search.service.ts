import { FormInstance } from 'antd';
import {
  AdminSearchQuery,
  DashboardSearchQuery,
  DashboardTrips,
  PaginatedRequest,
  PaginatedResponse,
  TripSearchByDateRange,
} from '@ayahay/http';
import axios from '@ayahay/services/axios';
import { SEARCH_API } from '@ayahay/constants';
import dayjs from 'dayjs';
import { isEmpty } from 'lodash';
import { fetchAssociatedEntitiesForReports } from './reporting.service';

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

export function initializeDashboardFormFromQueryParams(
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

export function buildUrlQueryParamsFromDashboardForm(
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

export function buildSearchQueryFromDashboardForm(
  form: FormInstance
): DashboardSearchQuery | undefined {
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
  searchQuery: DashboardSearchQuery | undefined,
  pagination: PaginatedRequest
): Promise<PaginatedResponse<DashboardTrips> | undefined> {
  if (isEmpty(searchQuery)) {
    return;
  }

  const query = new URLSearchParams({
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
