'use client';
import React from 'react';
import Image from 'next/image';
import styles from './WebHeader.module.scss';
import AyahayLogo from '/public/assets/ayahay-logo.png';
import { Button, Menu, notification } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { webLinks } from '@/services/nav.service';
import AuthForm from '@/components/auth/AuthForm';
import { usePathname, useRouter } from 'next/navigation';

export default function WebHeader() {
  const pathName = usePathname();
  const router = useRouter();
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
        <Image src={AyahayLogo} alt='Ayahay' height={80} />
        <ul className={styles['nav-links']}>
          <Menu
            mode='horizontal'
            style={{ background: 'none', borderBottomStyle: 'none' }}
            defaultSelectedKeys={webLinks
              .filter((link) => pathName === `/${link.key}`)
              .map((link) => link.key)}
            disabledOverflow={true}
            items={webLinks}
            onClick={({ key }) => router.push(key)}
          />
        </ul>
      </div>

      <div className={styles['nav-buttons']}>
        {contextHolder}
        <Button type='text' onClick={openNotification} size='large'>
          <BellOutlined style={{ fontSize: '18px' }} rev={undefined} />
        </Button>
        <AuthForm />
      </div>
    </nav>
  );
}
