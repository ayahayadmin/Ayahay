'use client';

import { useCallback, useEffect, useState } from 'react';
import { Form } from 'antd';
import styles from '@/common/components/Header.module.scss';
import dayjs from 'dayjs';
import TripSearchQuery from '@/common/components/TripSearchQuery';
import debounce from 'lodash/debounce';
import {
  buildSearchQueryFromSearchForm,
  buildUrlQueryParamsFromSearchForm,
} from '@/common/services/search.service';

export default function Trips() {
  const [form] = Form.useForm();

  const numAdults = Form.useWatch('numAdults', form);
  const numChildren = Form.useWatch('numChildren', form);
  const numInfants = Form.useWatch('numInfants', form);

  const onPageLoad = () => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());

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
    });

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
        className={styles.containerFluid}
        onValuesChange={onFormFieldsChange}
        onFinish={(_) => debounceSearch()}
      >
        <TripSearchQuery />
      </Form>
    </div>
  );
}
