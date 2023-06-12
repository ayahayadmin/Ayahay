import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './Header.module.scss';
import AyahayLogo from '/public/assets/ayahay-logo.png';
import Link from 'next/link';
import { Avatar, Button, Input, Modal, Space, notification } from 'antd';
import { BellOutlined, UserOutlined } from '@ant-design/icons';
import { useSearchParams } from 'next/navigation';

const { Search } = Input;

export default function Header() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [api, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onPageLoad = () => {
    const params = Object.fromEntries(searchParams.entries());

    setQuery(params.query);
  };

  useEffect(onPageLoad, []);

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
          title='Basic Modal'
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
          <p>Pick trip to send an email</p>
          <p>Email message body</p>
        </Modal>
        <Avatar icon={<UserOutlined />} />
      </div>
    </nav>
  );
}
