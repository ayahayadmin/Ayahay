'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Form } from 'antd';
import styles from './trips.module.scss';
import debounce from 'lodash/debounce';
import {
  buildSearchQueryFromSearchForm,
  buildUrlQueryParamsFromSearchForm,
  initializeSearchFormFromQueryParams,
} from '@/common/services/search.service';
import TripSearchQuery from '@/common/components/search/TripSearchQuery';
import TripSortOptions from '@/common/components/form/TripSortOptions';
import SearchResult from '@/app/trips/searchResults';
import CabinFilter from '@/common/components/form/CabinFilter';
import ShippingLineFilter from '@/common/components/form/ShippingLineFilter';
import SearchQuery from '@/common/models/search-query.model';

export default function Trips() {
  const [form] = Form.useForm();

  const numAdults = Form.useWatch('numAdults', form);
  const numChildren = Form.useWatch('numChildren', form);
  const numInfants = Form.useWatch('numInfants', form);

  const [searchQuery, setSearchQuery] = useState({} as SearchQuery);

  const onPageLoad = () => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    initializeSearchFormFromQueryParams(form, params);
    debounceSearch();
  };

  useEffect(onPageLoad, []);

  /*
    these form items are updated thru form.setFieldValue, so Form.onValueChange does not
    fire when they are updated. as a workaround, we watch the items manually for form changes
    and use it as dependency in useEffect
   */
  useEffect(() => debounceSearch(), [numAdults, numChildren, numInfants]);

  const debounceSearch = useCallback(debounce(performSearch, 300), []);

  function performSearch() {
    const query = buildSearchQueryFromSearchForm(form);
    setSearchQuery(query);
    updateUrl();
    console.log(searchQuery);
  }

  const updateUrl = () => {
    const updatedQueryParams = buildUrlQueryParamsFromSearchForm(form);
    const updatedUrl = `${window.location.origin}${window.location.pathname}?${updatedQueryParams}`;
    window.history.replaceState({ path: updatedUrl }, '', updatedUrl);
  };

  return (
    <Form
      form={form}
      onValuesChange={(_, __) => debounceSearch()}
      onFinish={(_) => debounceSearch()}
    >
      <TripSearchQuery />
      <TripSortOptions name='sort' label='Sort By' />
      <div className={styles.tripsBody}>
        <div className={styles.filter}>
          <CabinFilter name='cabinTypes' label='Cabin Types' />
          <ShippingLineFilter name='shippingLineIds' label='Shipping Lines' />
        </div>
        <div className={styles.searchResult}>
          <SearchResult searchQuery={searchQuery} />
        </div>
      </div>
    </Form>
  );
}
