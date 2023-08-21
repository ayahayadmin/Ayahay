import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './Header.module.scss';
import AyahayLogo from '/public/assets/ayahay-logo.png';
import Link from 'next/link';
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Space,
  message,
  notification,
} from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useSearchParams } from 'next/navigation';
import dayjs, { Dayjs } from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { ITrip } from '@ayahay/models';
import { RangePickerProps } from 'antd/es/date-picker';
import { filter, map } from 'lodash';
import { getAllTrips } from '@/services/trip.service';
import AuthForm from './auth/AuthForm';

const { Search } = Input;
const { RangePicker } = DatePicker;
const { TextArea } = Input;
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export default function Header() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [api, notifContextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dateToday = dayjs();
  const [tripsData, setTripsData] = useState([] as ITrip[]);
  const [startDate, setStartDate] = useState(dateToday.startOf('day') as Dayjs);
  const [endDate, setEndDate] = useState(dateToday.endOf('day') as Dayjs);
  const [emailBody, setEmailBody] = useState('');
  const [messageApi, msgContextHolder] = message.useMessage();

  const onPageLoad = () => {
    const params = Object.fromEntries(searchParams.entries());

    setQuery(params.query);
  };

  useEffect(onPageLoad, []);

  useEffect(() => {
    const trips = filter(getAllTrips(), (trip) => {
      return (
        startDate.isSameOrBefore(trip.departureDateIso) &&
        endDate.isSameOrAfter(trip.departureDateIso)
      );
    });

    setTripsData(trips);
  }, [startDate, endDate]);

  const onSearch = (value: string) =>
    window.location.assign(`/search?query=${value}`);

  const showModal = () => {
    api.destroy();
    setIsModalOpen(true);
  };

  const onClickCancel = () => {
    setIsModalOpen(false);
  };

  const openNotification = () => {
    const btn = (
      <Space>
        <Button type='primary' size='small' onClick={showModal}>
          Send an Announcement
        </Button>
      </Space>
    );
    api.open({
      message: 'Notifications',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      btn,
      duration: 0,
    });
  };

  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    return current && current < dayjs().startOf('day');
  };

  const onChange: RangePickerProps['onChange'] = (date, dateString) => {
    setStartDate(dayjs(dateString[0]).startOf('day'));
    setEndDate(dayjs(dateString[1]).endOf('day'));
  };

  const onFinish = (values: any) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsModalOpen(false);
      messageApi.open({
        type: 'success',
        content: 'Announcement Posted!',
      });
      console.log('Success:', values);
    }, 3000);
  };

  return (
    <nav className={styles['nav-container']}>
      <div className={styles['nav-main']}>
        <Image src={AyahayLogo} alt='Ayahay Logo' height={80} />
        <span className={styles['nav-links']}>
          <ul>
            <li>
              <Link href='/trips'>Trips</Link>
            </li>
            <li>
              <Link href='/dashboard'>Dashboard</Link>
            </li>
            <li>
              <Link href='/upload/trips'>Upload Trips</Link>
            </li>
            <li>
              <Link href='/upload/bookings'>Upload Bookings</Link>
            </li>
            <li>
              <Link href='/download/bookings'>Download Bookings</Link>
            </li>
          </ul>
        </span>
      </div>

      <div className={styles['nav-buttons']}>
        <Search
          placeholder='Search for booking...'
          onSearch={onSearch}
          style={{ width: 200 }}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {notifContextHolder}
        <Button type='text' onClick={openNotification}>
          <BellOutlined />
        </Button>
        {msgContextHolder}
        <Modal title='Send an Announcement' open={isModalOpen} footer={null}>
          <div>
            <Form
              name='announcement_form'
              // {...formItemLayoutWithOutLabel}
              onFinish={onFinish}
              style={{ maxWidth: 600 }}
            >
              <Form.Item
                label='Date Range'
                name='dateRange'
                rules={[
                  { required: true, message: 'Please choose date range' },
                ]}
              >
                <RangePicker
                  defaultValue={[startDate, endDate]}
                  disabledDate={disabledDate}
                  onChange={onChange}
                  className={styles['calendar']}
                />
              </Form.Item>
              <Form.Item
                label='Trips'
                name='trips'
                rules={[{ required: true, message: 'Please choose a trip' }]}
              >
                <Select
                  options={map(tripsData, (trip) => {
                    return {
                      value: `${trip.srcPort?.name}-${trip.destPort?.name}`,
                      label: `${trip.srcPort?.name} - ${trip.destPort?.name}`,
                    };
                  })}
                />
              </Form.Item>
              <Form.Item
                label='Subject'
                name='subject'
                rules={[
                  { required: true, message: 'Please input an email subject' },
                ]}
              >
                <Input placeholder='Input Email Subject' />
              </Form.Item>
              <Form.Item
                label='Message'
                name='message'
                rules={[
                  { required: true, message: 'Please input an email message' },
                ]}
              >
                <TextArea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder='Email body...'
                  autoSize={{ minRows: 3, maxRows: 5 }}
                />
              </Form.Item>
              <Form.Item className={styles['modal-buttons']}>
                <Button key='back' onClick={onClickCancel}>
                  Cancel
                </Button>
                <Button type='primary' htmlType='submit' loading={loading}>
                  Send
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Modal>
        <AuthForm />
      </div>
    </nav>
  );
}
