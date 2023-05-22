'use client';
import styles from './page.module.scss';
import React, { useCallback, useEffect, useState } from 'react';
import { Tabs, TabsProps, Typography } from 'antd';
import debounce from 'lodash/debounce';
import { useRouter, useSearchParams } from 'next/navigation';
import BookingPassengerResults from '@/app/search/bookingPassengerResults';

const { Title } = Typography;

enum SearchModel {
  BookingPassenger = 'Bookings',
  Trip = 'Trips',
}

export default function Search() {
  const [query, setQuery] = useState('');
  const [searchModel, setSearchModel] =
    useState<keyof typeof SearchModel>('BookingPassenger');

  const onPageLoad = () => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());

    setQuery(params.query);
    if (params.model && params.model in SearchModel) {
      setSearchModel(params.model as keyof typeof SearchModel);
    }
  };

  useEffect(onPageLoad, []);

  function performSearch() {
    console.log(query);
    updateUrl();
  }

  const updateUrl = () => {
    const searchQuery: Record<string, string> = {
      query,
      model: searchModel,
    };
    const queryParams = new URLSearchParams(searchQuery);
    const updatedUrl = `${window.location.origin}${
      window.location.pathname
    }?${queryParams.toString()}`;
    window.history.replaceState({ path: updatedUrl }, '', updatedUrl);
  };

  const onChangeTab = (tabKey: string) => {
    setSearchModel(tabKey as keyof typeof SearchModel);
  };

  useEffect(() => performSearch(), [query, searchModel]);

  const tabs: TabsProps['items'] = [
    {
      key: 'BookingPassenger',
      label: 'Bookings',
      children: <BookingPassengerResults query={query} />,
    },
    {
      key: 'Trip',
      label: 'Trips',
      children: 'Content of Trips',
    },
  ];

  return (
    <div className={styles['main-container']}>
      <Title level={1}>Search Results for "{query}"</Title>
      <Tabs
        defaultActiveKey='BookingPassenger'
        items={tabs}
        onChange={onChangeTab}
      />
    </div>
  );
}
