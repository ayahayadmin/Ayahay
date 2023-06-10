'use client';
import {
  buildAdminSearchQueryFromSearchForm,
  buildUrlQueryParamsFromAdminSearchForm,
  initializeAdminSearchFormFromQueryParams,
} from '@/services/search.service';
import { Form } from 'antd';
import { debounce } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import BookingList from './[id]/page';
import { AdminSearchQuery } from '@ayahay/models/admin-search-query';
import TripList from './tripList';
import { useSearchParams } from 'next/navigation';

export default function Schedules() {
  const searchParams = useSearchParams();
  const [form] = Form.useForm();
  const [searchQuery, setSearchQuery] = useState({} as AdminSearchQuery);

  const onPageLoad = () => {
    const params = Object.fromEntries(searchParams.entries());
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
        <TripList />
        {/* <BookingList /> */}
        {/* <div className={styles.chart}>
          <PieChart data={data} />
        </div>
        <div className={styles.chart}>
          <BarChart data={data} />
        </div>
        <div className={styles.chart}>
          <LineChart data={data} />
        </div>
        <CabinFilter name='cabinTypes' label='Cabin Types' />
        <TripResults searchQuery={searchQuery} /> */}
      </div>
    </Form>
  );
}
