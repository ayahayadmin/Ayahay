'use client';
import React from 'react';
import Image from 'next/image';
import styles from './WebHeader.module.scss';
import AyahayLogo from '/public/assets/ayahay-logo.png';
import { Menu } from 'antd';
import Notifications from '@ayahay/components/Notifications';
import { webLinks } from '@/services/nav.service';
import AuthForm from '@/components/auth/AuthForm';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';

export default function WebHeader() {
  const { loggedInAccount } = useAuth();
  const pathName = usePathname();
  const router = useRouter();

  return (
    <nav className={`hide-on-print ${styles['nav-container']}`}>
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
        <Notifications
          hasAdminPrivileges={
            loggedInAccount?.role === 'Admin' ||
            loggedInAccount?.role === 'SuperAdmin'
          }
        />
        <AuthForm />
      </div>
    </nav>
  );
}
