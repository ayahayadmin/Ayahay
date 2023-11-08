'use client';
import Sider from 'antd/es/layout/Sider';
import { Menu } from 'antd';
import { webLinks } from '@/services/nav.service';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import styles from './AdminSider.module.scss';
import { useAuth } from '@/app/contexts/AuthContext';

export default function AdminSider() {
  const { loggedInAccount } = useAuth();
  const pathName = usePathname();
  const router = useRouter();

  const userRole = loggedInAccount && loggedInAccount.role;
  const headerTabs =
    userRole === 'SuperAdmin' || userRole === 'Admin'
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
