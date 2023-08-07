import { FormInstance } from 'antd';
import { AdminSearchQuery } from '@ayahay/http';

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
