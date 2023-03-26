'use client';
import CabinFilter from '@/common/components/form/CabinFilter';
import AdminSearchQuery from '@/common/models/admin-search-query';
import {
  buildAdminSearchQueryFromSearchForm,
  buildUrlQueryParamsFromAdminSearchForm,
  initializeAdminSearchFormFromQueryParams,
} from '@/common/services/search.service';
import { Form } from 'antd';
import { debounce } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import TripResults from './tripResults';

export default function Admin() {
  const [form] = Form.useForm();
  const [searchQuery, setSearchQuery] = useState({} as AdminSearchQuery);

  const onPageLoad = () => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    initializeAdminSearchFormFromQueryParams(form, params);
    debounceSearch();
  };

  useEffect(onPageLoad, []);

  const debounceSearch = useCallback(debounce(performSearch, 300), []);

  function performSearch() {
    const query = buildAdminSearchQueryFromSearchForm(form);
    setSearchQuery(query);
    updateUrl();
    console.log(searchQuery);
  }

  const updateUrl = () => {
    const updatedQueryParams = buildUrlQueryParamsFromAdminSearchForm(form);
    const updatedUrl = `${window.location.origin}${window.location.pathname}?${updatedQueryParams}`;
    window.history.replaceState({ path: updatedUrl }, '', updatedUrl);
  };

  return (
    <Form
      form={form}
      onValuesChange={(_, __) => debounceSearch()}
      onFinish={(_) => debounceSearch()}
    >
      <div>
        <CabinFilter name='cabinTypes' label='Cabin Types' />
        <TripResults searchQuery={searchQuery} />
      </div>
    </Form>
  );
}
