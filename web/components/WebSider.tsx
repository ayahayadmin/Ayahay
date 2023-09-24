'use client';
import Sider from 'antd/es/layout/Sider';
import { Menu } from 'antd';
import { webLinks } from '@/services/nav.service';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import styles from './WebSider.module.scss';

export default function WebSider() {
  const pathName = usePathname();
  const router = useRouter();

  return (
    <Sider
      breakpoint='md'
      collapsedWidth='0'
      reverseArrow
      id={styles['web-sider']}
    >
      <nav id={styles['web-sider-nav']}>
        <Menu
          theme='dark'
          mode='inline'
          defaultSelectedKeys={webLinks
            .filter((link) => pathName === `/${link.key}`)
            .map((link) => link.key)}
          items={webLinks}
          onClick={({ key }) => router.push(key)}
        />
      </nav>
    </Sider>
  );
}
