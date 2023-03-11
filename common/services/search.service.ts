import { FormInstance } from 'antd';
import SearchQuery from '@/common/models/search-query';

export function buildUrlQueryParamsFromSearchForm(form: FormInstance): string {
  const searchQuery: Record<string, string> = {
    tripType: form.getFieldValue('tripType'),
    srcPortId: form.getFieldValue('srcPortId')?.toString(),
    destPortId: form.getFieldValue('destPortId')?.toString(),
    departureDate: form.getFieldValue('departureDate')?.format('YYYY-MM-DD'),
    numAdults: form.getFieldValue('numAdults')?.toString(),
    numChildren: form.getFieldValue('numChildren')?.toString(),
    numInfants: form.getFieldValue('numInfants')?.toString(),
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
  };

  if (searchQuery.tripType === 'round') {
    searchQuery.returnDateIso = form
      .getFieldValue('departureDate')
      .toISOString();
  }

  return searchQuery;
}
