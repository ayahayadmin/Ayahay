'use client';
import Sider from 'antd/es/layout/Sider';
import { Menu } from 'antd';
import { webLinks } from '@/services/nav.service';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import styles from './AdminSider.module.scss';
import { useLoggedInAccount } from '@ayahay/hooks/auth';

export default function AdminSider() {
  const { loggedInAccount } = useLoggedInAccount();
  const pathName = usePathname();
  const router = useRouter();

  const headerTabs =
    loggedInAccount && loggedInAccount.role === 'Admin'
      ? webLinks.Admin
      : webLinks.Staff;

  return (
    <div>
      {loggedInAccount && (
        <Sider
          breakpoint='md'
          collapsedWidth='0'
          reverseArrow
          id={styles['admin-sider']}
        >
          <nav id={styles['admin-sider-nav']}>
            <Menu
              theme='dark'
              mode='inline'
              defaultSelectedKeys={headerTabs
                .filter((link) => pathName === `/${link.key}`)
                .map((link) => link.key)}
              items={headerTabs}
              onClick={({ key }) => router.push(key)}
            />
          </nav>
        </Sider>
      )}
    </div>
  );
}
