import { FormInstance } from 'antd';
import SearchQuery from '@/common/models/search-query';
import dayjs from 'dayjs';

export function initializeSearchFormFromQueryParams(
  form: FormInstance,
  params: { [p: string]: string }
) {
  form.setFieldsValue({
    tripType: params.tripType,
    srcPortId: +params.srcPortId,
    destPortId: +params.destPortId,
    numAdults: +params.numAdults,
    numChildren: +params.numChildren,
    numInfants: +params.numInfants,
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
    departureDate: form.getFieldValue('departureDate')?.format('YYYY-MM-DD'),
    numAdults: form.getFieldValue('numAdults')?.toString(),
    numChildren: form.getFieldValue('numChildren')?.toString(),
    numInfants: form.getFieldValue('numInfants')?.toString(),
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
): SearchQuery {
  const searchQuery: SearchQuery = {
    tripType: form.getFieldValue('tripType'),
    srcPortId: form.getFieldValue('srcPortId'),
    destPortId: form.getFieldValue('destPortId'),
    departureDateIso: form.getFieldValue('departureDate').toISOString(),
    numAdults: form.getFieldValue('numAdults'),
    numChildren: form.getFieldValue('numChildren'),
    numInfants: form.getFieldValue('numInfants'),
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
