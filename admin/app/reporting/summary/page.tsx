'use client';
import {
  buildSearchQueryFromRangePickerForm,
  buildUrlQueryParamsFromRangePickerForm,
  initializeRangePickerFormFromQueryParams,
} from '@/services/search.service';
import { DatePicker, Form, Typography } from 'antd';
import { debounce } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { TripSearchByDateRange } from '@ayahay/http';
import { useSearchParams } from 'next/navigation';
import { useAuthGuard } from '@/hooks/auth';
import styles from './page.module.scss';
import dayjs from 'dayjs';
import { RangePickerProps } from 'antd/es/date-picker';
import { DATE_FORMAT_LIST, DATE_PLACEHOLDER } from '@ayahay/constants';
import ShipList from './shipList';

const { RangePicker } = DatePicker;
const { Title } = Typography;

export default function Reporting() {
  useAuthGuard(['Staff', 'Admin', 'SuperAdmin']);
  const [form] = Form.useForm();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    {} as TripSearchByDateRange | undefined
  );

  const onPageLoad = () => {
    const params = Object.fromEntries(searchParams.entries());
    initializeRangePickerFormFromQueryParams(form, params);
    debounceSearch();
  };

  useEffect(onPageLoad, []);

  const debounceSearch = useCallback(debounce(performSearch, 300), []);

  function performSearch() {
    const query = buildSearchQueryFromRangePickerForm(form);
    setSearchQuery(query);
    updateUrl();
  }

  const updateUrl = () => {
    const updatedQueryParams = buildUrlQueryParamsFromRangePickerForm(form);
    const updatedUrl = `${window.location.origin}${window.location.pathname}?${updatedQueryParams}`;
    window.history.replaceState({ path: updatedUrl }, '', updatedUrl);
  };

  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    const lastYear = dayjs().subtract(1, 'year');
    return lastYear && current < lastYear.startOf('day');
  };

  return (
    <div className={styles['main-container']}>
      <Title level={1} style={{ fontSize: 25 }}>
        Summary Sales
      </Title>
      <Form
        form={form}
        initialValues={{ dateRange: [dayjs(), dayjs()] }}
        onValuesChange={(_, __) => debounceSearch()}
      >
        <div className={styles['form-item']}>
          <Form.Item name='dateRange' label='Date Range'>
            <RangePicker
              disabledDate={disabledDate}
              format={DATE_FORMAT_LIST}
              placeholder={[DATE_PLACEHOLDER, DATE_PLACEHOLDER]}
              className={styles['range-picker']}
            />
          </Form.Item>
        </div>
      </Form>

      <div>
        <ShipList searchQuery={searchQuery} />
      </div>
    </div>
  );
}
