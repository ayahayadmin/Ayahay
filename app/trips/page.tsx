'use client';

import { useCallback, useEffect, useState } from 'react';
import { Form } from 'antd';
import styles from './trips.module.scss';
import debounce from 'lodash/debounce';
import {
  buildSearchQueryFromSearchForm,
  buildUrlQueryParamsFromSearchForm,
  initializeSearchFormFromQueryParams,
} from '@/common/services/search.service';
import TripSearchQuery from '@/common/components/search/TripSearchQuery';
import TripSearchFilters from '@/common/components/search/TripSearchFilters';
import TripSortOptions from '@/common/components/form/TripSortOptions';
import SearchResult from './searchResults';

export default function Trips() {
  const [form] = Form.useForm();

  const numAdults = Form.useWatch('numAdults', form);
  const numChildren = Form.useWatch('numChildren', form);
  const numInfants = Form.useWatch('numInfants', form);

  const onPageLoad = () => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    initializeSearchFormFromQueryParams(form, params);
    debounceSearch();
  };

  useEffect(onPageLoad, []);
  useEffect(() => debounceSearch(), [numAdults, numChildren, numInfants]);

  const debounceSearch = useCallback(debounce(performSearch, 300), []);

  function performSearch() {
    const searchQuery = buildSearchQueryFromSearchForm(form);
    updateUrl();
    console.log(searchQuery);
  }

  const updateUrl = () => {
    const updatedQueryParams = buildUrlQueryParamsFromSearchForm(form);
    const updatedUrl = `${window.location.origin}${window.location.pathname}?${updatedQueryParams}`;
    window.history.replaceState({ path: updatedUrl }, '', updatedUrl);
  };

  const onFormFieldsChange = (_: any, __: any) => {
    debounceSearch();
  };

  return (
    <div>
      <Form
        form={form}
        onValuesChange={onFormFieldsChange}
        onFinish={(_) => debounceSearch()}
      >
        <TripSearchQuery />
        <TripSortOptions name='sort' label='Sort By' />
      </Form>
      <div className={styles.tripsBody}>
        <div className={styles.filter}>
          <TripSearchFilters />
        </div>
        <div className={styles.searchResult}>
          <SearchResult />
        </div>
      </div>
    </div>
  );
}
