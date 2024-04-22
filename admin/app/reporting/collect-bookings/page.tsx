'use client';
import { useAuthGuard } from '@/hooks/auth';
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Divider,
  Form,
  Row,
  Typography,
} from 'antd';
import styles from './page.module.scss';
import dayjs from 'dayjs';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { debounce } from 'lodash';
import { CollectTripBooking, TripSearchByDateRange } from '@ayahay/http';
import { RangePickerProps } from 'antd/es/date-picker';
import { DATE_FORMAT_LIST, DATE_PLACEHOLDER } from '@ayahay/constants';
import {
  buildSearchQueryFromRangePickerForm,
  buildUrlQueryParamsFromRangePickerForm,
  initializeRangePickerFormFromQueryParams,
} from '@/services/search.service';
import { DownloadOutlined, FilePdfTwoTone } from '@ant-design/icons';
import jsPDF from 'jspdf';
import { getCollectTripBooking } from '@/services/reporting.service';
import { getTripsByDateRange } from '@/services/trip.service';
import CollectTripBookings from '@/components/reports/CollectTripBookings';

const { RangePicker } = DatePicker;
const { Title } = Typography;

export default function CollectBookingsPage() {
  useAuthGuard(['ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin']);
  const [form] = Form.useForm();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    {} as TripSearchByDateRange | undefined
  );
  const [data, setData] = useState([] as CollectTripBooking[] | undefined);
  const [tripOptions, setTripOptions] = useState(
    [] as { label: string; value: number }[]
  );
  const [checkedList, setCheckedList] = useState([] as number[]);
  const [checkAll, setCheckAll] = useState(false);
  const [buildReportClicked, setBuildReportClicked] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const collectBookingsRef = useRef();

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
    setBuildReportClicked(false);
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

  useEffect(() => {
    setCheckedList([]);
    fetchTrips(searchQuery);
  }, [searchQuery]);

  const fetchTrips = async (searchQuery: any) => {
    const trips = await getTripsByDateRange(searchQuery);
    if (trips === undefined) {
      return;
    }

    setTripOptions(
      trips.map((trip) => {
        return {
          label: `${trip.srcPortName} to ${trip.destPortName} at ${dayjs(
            trip.departureDateIso
          ).format('MMMM D, YYYY h:mm A')}`,
          value: trip.id,
        };
      })
    );
  };

  const onChange = (list: any) => {
    setCheckedList(list);
    setCheckAll(list.length === tripOptions.length);
    setBuildReportClicked(false);
  };

  const onCheckAllChange = (e: any) => {
    setCheckedList(
      e.target.checked ? tripOptions.map(({ value }) => value) : []
    );
    setCheckAll(e.target.checked);
    setBuildReportClicked(false);
  };

  const fetchCollectTripBookings = async () => {
    setIsFetchingData(true);
    setData(await getCollectTripBooking(checkedList));
    setIsFetchingData(false);
    setBuildReportClicked(true);
  };

  const handleDownloadCollectBookings = async () => {
    const doc = new jsPDF('l', 'pt', 'a4', true);
    doc.html(collectBookingsRef.current, {
      async callback(doc) {
        await doc.save(`collect-bookings`);
      },
      margin: [25, 0, 25, 0],
    });
  };

  return (
    <div className={styles['main-container']}>
      <Title level={1} style={{ fontSize: 25 }}>
        Collect Bookings
      </Title>
      <Form
        form={form}
        initialValues={{ dateRange: [dayjs(), dayjs()] }}
        onValuesChange={(_, __) => debounceSearch()}
        onFinish={fetchCollectTripBookings}
      >
        <Form.Item name='dateRange' label='Date Range'>
          <RangePicker
            disabledDate={disabledDate}
            format={DATE_FORMAT_LIST}
            placeholder={[DATE_PLACEHOLDER, DATE_PLACEHOLDER]}
            className={styles['range-picker']}
          />
        </Form.Item>

        {tripOptions && (
          <div style={{ margin: 10, marginBottom: 20 }}>
            <Checkbox onChange={onCheckAllChange} checked={checkAll}>
              Check all
            </Checkbox>
            <Divider />
            <Checkbox.Group value={checkedList} onChange={onChange}>
              <Row gutter={[64, 24]}>
                {tripOptions.map((option) => {
                  return (
                    <Col xs={24} md={12} lg={8} xxl={6}>
                      <Checkbox value={option.value}>{option.label}</Checkbox>
                    </Col>
                  );
                })}
              </Row>
            </Checkbox.Group>
          </div>
        )}

        <div className={styles['buttons']}>
          <Button
            htmlType='submit'
            disabled={searchQuery === undefined || checkedList.length === 0}
            loading={data === undefined}
          >
            <FilePdfTwoTone /> Build Report
          </Button>
          <Button
            type='primary'
            disabled={!buildReportClicked}
            loading={isFetchingData}
            onClick={handleDownloadCollectBookings}
          >
            <DownloadOutlined /> Download
          </Button>
        </div>
      </Form>

      <div style={{ display: 'none' }}>
        {data && <CollectTripBookings data={data} ref={collectBookingsRef} />}
      </div>
    </div>
  );
}
