import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './Header.module.scss';
import AyahayLogo from '/public/assets/ayahay-logo.png';
import Link from 'next/link';
import {
  Avatar,
  Button,
  DatePicker,
  Input,
  Modal,
  Select,
  Space,
  notification,
} from 'antd';
import { BellOutlined, UserOutlined } from '@ant-design/icons';
import { useSearchParams } from 'next/navigation';
import dayjs, { Dayjs } from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { ITrip } from '@ayahay/models';
import { RangePickerProps } from 'antd/es/date-picker';
import { filter, map } from 'lodash';
import { getAllTrips } from '@/services/trip.service';

const { Search } = Input;
const { RangePicker } = DatePicker;
const { TextArea } = Input;
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export default function Header() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [api, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dateToday = dayjs();
  const [tripsData, setTripsData] = useState([] as ITrip[]);
  const [startDate, setStartDate] = useState(dateToday.startOf('day') as Dayjs);
  const [endDate, setEndDate] = useState(dateToday.endOf('day') as Dayjs);
  const [emailBody, setEmailBody] = useState('');

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

  const onClickSend = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsModalOpen(false);
    }, 3000);
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
        {contextHolder}
        <Button type='text' onClick={openNotification}>
          <BellOutlined />
        </Button>
        <Modal
          title='Send an Announcement'
          open={isModalOpen}
          onOk={onClickSend}
          onCancel={onClickCancel}
          footer={[
            <Button key='back' onClick={onClickCancel}>
              Cancel
            </Button>,
            <Button
              key='submit'
              type='primary'
              loading={loading}
              onClick={onClickSend}
            >
              Send
            </Button>,
          ]}
        >
          <div className={styles['input-outer']}>
            Date Range:{' '}
            <RangePicker
              defaultValue={[startDate, endDate]}
              disabledDate={disabledDate}
              onChange={onChange}
              className={styles['input-inner']}
            />
          </div>
          <div className={styles['input-outer']}>
            Trips:{' '}
            <Select
              options={map(tripsData, (trip) => {
                return {
                  value: `${trip.srcPort?.name}-${trip.destPort?.name}`,
                  label: `${trip.srcPort?.name} - ${trip.destPort?.name}`,
                };
              })}
              className={styles['input-inner']}
            />
          </div>
          <div className={styles['input-outer']}>
            Subject:{' '}
            <Input
              placeholder='Input Email Subject'
              className={styles['input-inner']}
            />
          </div>
          <div className={styles['input-outer']}>
            Message:
            <TextArea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              placeholder='Controlled autosize'
              autoSize={{ minRows: 3, maxRows: 5 }}
              className={styles['input-inner']}
            />
          </div>
        </Modal>
        <Avatar icon={<UserOutlined />} />
      </div>
    </nav>
  );
}

// TO DO:
// - Get the values of trips, subject email, email body
// - Send button function
