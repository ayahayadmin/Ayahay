import { FormInstance } from 'antd';
import { TripsSearchQuery } from '@ayahay/http';
import dayjs from 'dayjs';
import {
  DEFAULT_NUM_PASSENGERS,
  DEFAULT_NUM_VEHICLES,
  DEFAULT_TRIP_TYPE,
} from '@ayahay/constants/default';

export function initializeSearchFormFromQueryParams(
  form: FormInstance,
  params: { [p: string]: string }
) {
  form.setFieldsValue({
    tripType: params.tripType ?? DEFAULT_TRIP_TYPE,
    srcPortId: params.srcPortId ? +params.srcPortId : undefined,
    destPortId: params.destPortId ? +params.destPortId : undefined,
    numPassengers: params.numPassengers
      ? +params.numPassengers
      : DEFAULT_NUM_PASSENGERS,
    numVehicles: params.numVehicles
      ? +params.numVehicles
      : DEFAULT_NUM_VEHICLES,
    departureDate: dayjs(params.departureDate),
    returnDate: params.returnDate
      ? dayjs(params.returnDate)
      : dayjs(params.departureDate),
    shippingLineIds: params.shippingLineIds
      ?.split(',')
      .map((idString) => +idString),
    cabinTypes: params.cabinTypes?.split(','),
    sort: params.sort ?? 'departureDate',
  });
}

export function buildUrlQueryParamsFromSearchForm(form: FormInstance): string {
  const searchQuery: Record<string, string> = {
    tripType: form.getFieldValue('tripType'),
    srcPortId: form.getFieldValue('srcPortId')?.toString(),
    destPortId: form.getFieldValue('destPortId')?.toString(),
    departureDate: form.getFieldValue('departureDate')?.toISOString(),
    numPassengers: form.getFieldValue('numPassengers')?.toString(),
    numVehicles: form.getFieldValue('numVehicles')?.toString(),
    shippingLineIds: form.getFieldValue('shippingLineIds')?.toString(),
    cabinTypes: form.getFieldValue('cabinTypes')?.toString(),
    sort: form.getFieldValue('sort'),
  };

  if (searchQuery.tripType === 'round') {
    searchQuery.returnDate = form
      .getFieldValue('returnDate')
      ?.format('YYYY-MM-DD');
  }

  Object.keys(searchQuery).forEach((key) => {
    if (searchQuery[key] === undefined) {
      delete searchQuery[key];
    }
  });

  return new URLSearchParams(searchQuery).toString();
}

export function buildSearchQueryFromSearchForm(
  form: FormInstance
): TripsSearchQuery {
  const searchQuery: TripsSearchQuery = {
    tripType: form.getFieldValue('tripType'),
    srcPortId: form.getFieldValue('srcPortId'),
    destPortId: form.getFieldValue('destPortId'),
    departureDateIso: form.getFieldValue('departureDate').toISOString(),
    numPassengers: form.getFieldValue('numPassengers'),
    numVehicles: form.getFieldValue('numVehicles'),
    shippingLineIds: form.getFieldValue('shippingLineIds'),
    cabinTypes: form.getFieldValue('cabinTypes'),
    sort: form.getFieldValue('sort'),
  };

  if (searchQuery.tripType === 'round') {
    searchQuery.returnDateIso = form
      .getFieldValue('departureDate')
      .toISOString();
  }

  return searchQuery;
}

export function getTime(date: string) {
  return new Date(date).toLocaleTimeString('en-US');
}
