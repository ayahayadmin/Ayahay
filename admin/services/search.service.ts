import { FormInstance } from 'antd';
import {
  AdminSearchQuery,
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
  searchQuery: TripSearchByDateRange | undefined,
  pagination: PaginatedRequest
): Promise<PaginatedResponse<DashboardTrips> | undefined> {
  if (isEmpty(searchQuery)) {
    return;
  }
  const { startDate, endDate } = searchQuery;
  const query = new URLSearchParams(pagination as any).toString();

  try {
    const { data: dashboardTrips } = await axios.get<
      PaginatedResponse<DashboardTrips>
    >(
      `${SEARCH_API}/dashboard?startDate=${startDate}&endDate=${endDate}&${query}`
    );

    await fetchAssociatedEntitiesForReports(dashboardTrips.data);
    return dashboardTrips;
  } catch (e) {
    console.error(e);
  }
}
