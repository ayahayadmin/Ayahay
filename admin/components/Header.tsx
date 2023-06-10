import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './Header.module.scss';
import AyahayLogo from '/public/assets/ayahay-logo.png';
import Link from 'next/link';
import { Avatar, Input } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useSearchParams } from 'next/navigation';

const { Search } = Input;

export default function Header() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');

  const onPageLoad = () => {
    const params = Object.fromEntries(searchParams.entries());

    setQuery(params.query);
  };

  useEffect(onPageLoad, []);

  const onSearch = (value: string) =>
    window.location.assign(`/search?query=${value}`);

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
        <Avatar icon={<UserOutlined />} />
      </div>
    </nav>
  );
}
