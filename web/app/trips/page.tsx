'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Form } from 'antd';
import styles from './page.module.scss';
import debounce from 'lodash/debounce';
import {
  buildSearchQueryFromSearchForm,
  buildUrlQueryParamsFromSearchForm,
  initializeSearchFormFromQueryParams,
} from '@/services/search.service';
import TripSearchQuery from '@/components/search/TripSearchQuery';
import TripSortOptions from '@/components/form/TripSortOptions';
import SearchResult from '@/app/trips/searchResults';
import CabinFilter from '@/components/form/CabinFilter';
import ShippingLineFilter from '@/components/form/ShippingLineFilter';
import { TripsSearchQuery } from '@ayahay/http';
import { useSearchParams } from 'next/navigation';

export default function Trips() {
  const [form] = Form.useForm();
  const searchParams = useSearchParams();

  const numPassengers = Form.useWatch('numPassengers', form);
  const numVehicles = Form.useWatch('numVehicles', form);

  const [searchQuery, setSearchQuery] = useState({} as TripsSearchQuery);

  const onPageLoad = () => {
    const params = Object.fromEntries(searchParams.entries());
    initializeSearchFormFromQueryParams(form, params);
    debounceSearch();
  };

  useEffect(onPageLoad, []);

  /*
    these form items are updated thru form.setFieldValue, so Form.onValueChange does not
    fire when they are updated. as a workaround, we watch the items manually for form changes
    and use it as dependency in useEffect
   */
  useEffect(() => debounceSearch(), [numPassengers, numVehicles]);

  const debounceSearch = useCallback(debounce(performSearch, 300), []);

  function performSearch() {
    const query = buildSearchQueryFromSearchForm(form);
    setSearchQuery(query);
    updateUrl();
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
      <div className={styles['query-container']}>
        <TripSearchQuery />
      </div>
      <div className={styles['main-container']}>
        <div className={styles['left-container']}>
          <div className={styles['left-card']}>
            <div className={styles['cabin-card']}>
              <CabinFilter name='cabinTypes' label='Cabin Types' />
            </div>
            <div className={styles['shipping-card']}>
              <ShippingLineFilter
                name='shippingLineIds'
                label='Shipping Lines'
              />
            </div>
          </div>
        </div>
        <div className={styles['right-container']}>
          <div className={styles['sort-container']}>
            <div className={styles['sort-card']}>
              <TripSortOptions name='sort' label='Sort By' />
            </div>
          </div>
          <div className={styles['results-card']}>
            <SearchResult searchQuery={searchQuery} />
          </div>
        </div>
      </div>
    </Form>
  );
}
