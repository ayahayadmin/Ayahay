'use client';
import { Button, DatePicker, Form } from 'antd';
import { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import styles from './page.module.scss';
import { useAuthGuard } from '@/hooks/auth';
import { useSearchParams } from 'next/navigation';
import {
  buildSearchQueryFromDashboardForm,
  buildUrlQueryParamsFromDashboardForm,
  initializeDashboardFormFromQueryParams,
} from '@/services/search.service';
import { DashboardSearchQuery } from '@ayahay/http';
import { DATE_FORMAT_LIST, DATE_PLACEHOLDER } from '@ayahay/constants';
import { debounce } from 'lodash';
import DashboardTable from './dashboardTable';
import PortAutoComplete from '@ayahay/components/form/PortAutoComplete';

const { RangePicker } = DatePicker;
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export default function Dashboard() {
  useAuthGuard([
    'ShippingLineScanner',
    'ShippingLineStaff',
    'ShippingLineAdmin',
    'SuperAdmin',
  ]);
  const [form] = Form.useForm();
  const srcPortId = Form.useWatch('srcPortId', form);
  const destPortId = Form.useWatch('destPortId', form);
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(
    {} as DashboardSearchQuery | undefined
  );

  const onPageLoad = () => {
    const params = Object.fromEntries(searchParams.entries());
    initializeDashboardFormFromQueryParams(form, params);
    debounceSearch();
  };

  useEffect(onPageLoad, []);

  const debounceSearch = useCallback(debounce(performSearch, 300), []);

  function performSearch() {
    const query = buildSearchQueryFromDashboardForm(form);
    setSearchQuery(query);
    updateUrl();
  }

  const updateUrl = () => {
    const updatedQueryParams = buildUrlQueryParamsFromDashboardForm(form);
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
        <div className={styles['port-input']}>
          <Form.Item name='srcPortId' label='Origin Port'>
            <PortAutoComplete
              excludePortId={destPortId}
              size='medium'
              labelCol={{ span: 24 }}
              colon={false}
              name='srcPortId'
              className={styles['input']}
            />
          </Form.Item>
          <Form.Item name='destPortId' label='Destination Port'>
            <PortAutoComplete
              excludePortId={srcPortId}
              size='medium'
              labelCol={{ span: 24 }}
              colon={false}
              name='destPortId'
              className={styles['input']}
            />
          </Form.Item>
          <Button
            onClick={() => {
              form.resetFields(['srcPortId', 'destPortId']);
              debounceSearch();
            }}
            className={styles['clear-btn']}
          >
            Clear Ports
          </Button>
        </div>
      </Form>
      <div>
        <DashboardTable searchQuery={searchQuery} />
      </div>
    </div>
  );
}
