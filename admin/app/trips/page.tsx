'use client';
import {
  buildAdminSearchQueryFromSearchForm,
  buildUrlQueryParamsFromAdminSearchForm,
  initializeAdminSearchFormFromQueryParams,
} from '@/services/search.service';
import { Form, Spin } from 'antd';
import { debounce } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { AdminSearchQuery } from '@ayahay/http';
import TripList from './tripList';
import { redirect, useSearchParams } from 'next/navigation';
import { useAuthGuard, useAuthState } from '@/hooks/auth';
import styles from './page.module.scss';
import { useAuth } from '../contexts/AuthContext';

export default function Schedules() {
  useAuthGuard(['Staff', 'Admin', 'SuperAdmin']);
  const { loggedInAccount } = useAuth();
  const searchParams = useSearchParams();
  const [form] = Form.useForm();
  const [searchQuery, setSearchQuery] = useState({} as AdminSearchQuery);
  const [hasAdminPrivileges, setHasAdminPrivileges] = useState(false);

  const onPageLoad = () => {
    if (loggedInAccount === null) {
      return;
    }
    const params = Object.fromEntries(searchParams.entries());
    initializeAdminSearchFormFromQueryParams(form, params);
    debounceSearch();
  };

  useEffect(onPageLoad, []);

  useEffect(() => {
    if (loggedInAccount === null) {
      return;
    }

    const _hasAdminPrivileges = loggedInAccount?.role !== 'Staff';
    setHasAdminPrivileges(_hasAdminPrivileges);

    if (!_hasAdminPrivileges) {
      return;
    }
  }, [loggedInAccount]);

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
      <div className={styles['main-container']}>
        <TripList hasAdminPrivileges={hasAdminPrivileges} />
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
