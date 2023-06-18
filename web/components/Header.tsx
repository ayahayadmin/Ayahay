'use client';
import React from 'react';
import Image from 'next/image';
import styles from './Header.module.scss';
import AyahayLogo from '/public/assets/ayahay-logo.png';
import Link from 'next/link';
import { Button, notification } from 'antd';
import { BellOutlined } from '@ant-design/icons';

export default function Header() {
  const [api, contextHolder] = notification.useNotification();

  const openNotification = () => {
    api.open({
      message: 'Notifications',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
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
              <Link href='/'>Home</Link>
            </li>
            <li>
              <Link href='/trips'>Destinations</Link>
            </li>
            <li>
              <a href='#'>About Us</a>
            </li>
            <li>
              <a href='#'>My Account</a>
            </li>
            <li>
              <a href='#'>Contact</a>
            </li>
          </ul>
        </span>
      </div>

      <div className={styles['nav-buttons']}>
        <Link href='/trips' className='button'>
          Book Now
        </Link>
        <a className='button' href='/auth/signIn'>
          Sign In
        </a>
        <a className='button' href='/auth/register'>
          Register
        </a>
        {contextHolder}
        <Button type='text' onClick={openNotification}>
          <BellOutlined />
        </Button>
      </div>
    </nav>
  );
}
