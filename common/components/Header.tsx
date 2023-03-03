'use client';
import React from 'react';
import { CaretDownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Menu, Space } from 'antd';
import styles from './Header.module.css';

type MenuItem = Required<MenuProps>['items'][number];

const getItem = (
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group'
): MenuItem => {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
};

const items: MenuProps['items'] = [
  getItem('Home', 'home'),
  getItem('Destinations', 'destinations'),
  getItem('About us', 'aboutUs'),
  getItem('My Account', 'myAccount', <CaretDownOutlined />, [
    getItem('Sub Menu 1', 'subMenu1'),
    getItem('Sub Menu 2', 'subMenu2'),
  ]),
  getItem('Contact', 'contact'),
];

export default function Header() {
  return (
    <div className={styles.containerFluid}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <a href='https://www.google.com'>
            <img src='/assets/ayahay_logo.png' alt='Ayahay Logo' />
          </a>
        </div>
        <Menu mode='horizontal' defaultSelectedKeys={['1']} items={items} />
        <div className={styles.buttons}>
          <Space size='middle'>
            <Button type='primary' size='large'>
              Book Now
            </Button>
            <Button size='large'>Sign In</Button>
            <Button size='large'>Register</Button>
          </Space>
        </div>
      </div>
    </div>
  );
}
