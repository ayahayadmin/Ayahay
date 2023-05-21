import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './Header.module.scss';
import AyahayLogo from '/public/assets/ayahay-logo.png';
import Link from 'next/link';
import { Avatar, Input } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Search } = Input;

export default function Header() {
  const [query, setQuery] = useState('');

  const onPageLoad = () => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());

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
              <a href='#'>Dashboard</a>
            </li>
            <li>
              <a href='#'>Database</a>
            </li>
            <li>
              <a href='/trips/upload'>Upload</a>
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
