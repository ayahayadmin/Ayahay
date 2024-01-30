'use client';
import { DatePicker, Form, TimeRangePickerProps } from 'antd';
import { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import styles from './page.module.scss';
import { useAuthGuard } from '@/hooks/auth';
import { useSearchParams } from 'next/navigation';
import {
  buildSearchQueryFromRangePickerForm,
  buildUrlQueryParamsFromRangePickerForm,
  initializeRangePickerFormFromQueryParams,
} from '@/services/search.service';
import { TripSearchByDateRange } from '@ayahay/http';
import { DATE_FORMAT_LIST, DATE_PLACEHOLDER } from '@ayahay/constants';
import { debounce } from 'lodash';
import DashboardTable from './dashboardTable';

const { RangePicker } = DatePicker;
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export default function Dashboard() {
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
      <Form
        form={form}
        initialValues={{ dateRange: [dayjs(), dayjs()] }}
        onValuesChange={(_, __) => debounceSearch()}
      >
        <Form.Item name='dateRange' label='Date Range'>
          <RangePicker
            disabledDate={disabledDate}
            format={DATE_FORMAT_LIST}
            placeholder={[DATE_PLACEHOLDER, DATE_PLACEHOLDER]}
            className={styles['range-picker']}
          />
        </Form.Item>
      </Form>
      <div>
        <DashboardTable searchQuery={searchQuery} />
      </div>
    </div>
  );
}
