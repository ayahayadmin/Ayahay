'use client';
import Sider from 'antd/es/layout/Sider';
import { Menu } from 'antd';
import { webLinks } from '@/services/nav.service';
import React, { useEffect, useState } from 'react';
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
            .filter((link) => pathName === link.url)
            .map((link) => link.url)}
          items={webLinks.map((link) => ({
            key: link.url,
            label: link.label,
          }))}
          onClick={({ key }) => router.push(key)}
        />
      </nav>
    </Sider>
  );
}
