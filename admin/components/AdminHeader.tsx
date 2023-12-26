import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './AdminHeader.module.scss';
import AyahayLogo from '/public/assets/ayahay-logo.png';
import { Input, Menu } from 'antd';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import Logout from './auth/Logout';
import { webLinks } from '@/services/nav.service';
import { useAuth } from '@/contexts/AuthContext';
import Notifications from '@ayahay/components/Notifications';

const { Search } = Input;
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const popoverContent = (onSearch: any, query: string, setQuery: any) => {
  return (
    <Search
      placeholder='Search for booking...'
      onSearch={onSearch}
      style={{ width: 200 }}
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
};

export default function AdminHeader() {
  const { loggedInAccount } = useAuth();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const pathName = usePathname();
  const router = useRouter();

  const userRole = loggedInAccount && loggedInAccount.role;
  const headerTabs =
    userRole === 'SuperAdmin' || userRole === 'Admin'
      ? webLinks.Admin
      : webLinks.Staff;

  const onPageLoad = () => {
    const params = Object.fromEntries(searchParams.entries());

    setQuery(params.query);
  };

  useEffect(onPageLoad, []);

  return (
    <nav className={`hide-on-print ${styles['nav-container']}`}>
      <div className={styles['nav-main']}>
        <Image src={AyahayLogo} alt='Ayahay' height={80} />
        {loggedInAccount && userRole !== 'Passenger' && (
          <ul className={styles['nav-links']}>
            <Menu
              mode='horizontal'
              style={{ background: 'none', borderBottomStyle: 'none' }}
              defaultSelectedKeys={headerTabs
                .filter((link) => pathName === `/${link.key}`)
                .map((link) => link.key)}
              disabledOverflow={true}
              items={headerTabs}
              onClick={({ key }) => router.push(key)}
            />
          </ul>
        )}
      </div>

      {loggedInAccount && userRole !== 'Passenger' && (
        <div className={styles['nav-buttons']}>
          <Notifications
            hasAdminPrivileges={
              loggedInAccount.role === 'Admin' ||
              loggedInAccount.role === 'SuperAdmin'
            }
          />
          <Logout />
        </div>
      )}
    </nav>
  );
}
