'use client';
import React from 'react';
import styles from './Footer.module.scss';
import {
  FacebookFilled,
  InstagramFilled,
  TwitterSquareFilled,
} from '@ant-design/icons';
import { Col, Input, Row, Space } from 'antd';

const { Search } = Input;

export default function Footer() {
  const onSearch = (value: string) => console.log(value);

  return (
    <footer className={styles.containerFluid}>
      <Row>
        <Col span={6}>
          <Row>
            <span>Toll Free Customer Care</span>
          </Row>
          <Row>
            <h3>+(999) 999 999</h3>
          </Row>
        </Col>
        <Col span={6}>
          <Row>
            <span>Need live support?</span>
          </Row>
          <Row>
            <h3>support@ayahay.com</h3>
          </Row>
        </Col>
        <Col span={12}>
          <h3>Get Updates & More</h3>
          <br />
          <Search
            placeholder='john@email.com'
            allowClear
            enterButton='Subscribe'
            size='large'
            onSearch={onSearch}
          />
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <span>Follow us on social media</span>
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <Space>
            <FacebookFilled className={styles.icon} />
            <InstagramFilled className={styles.icon} />
            <TwitterSquareFilled className={styles.icon} />
          </Space>
        </Col>
        <Col span={4}>
          <h3>Company</h3>
          <Row>
            <a href='/'>About Us</a>
          </Row>
          <Row>
            <a href='/'>Careers</a>
          </Row>
          <Row>
            <a href='/'>Press</a>
          </Row>
        </Col>
        <Col span={4}>
          <h3>Support</h3>
          <Row>
            <a href='/'>Customer Care</a>
          </Row>
          <Row>
            <a href='/'>Contact</a>
          </Row>
          <Row>
            <a href='/'>Sitemap</a>
          </Row>
        </Col>
        <Col span={4}>
          <h3>Legal Docs</h3>
          <Row>
            <a href='/'>Legal Notice</a>
          </Row>
          <Row>
            <a href='/'>Privacy Policy</a>
          </Row>
          <Row>
            <a href='/'>Terms and Conditions</a>
          </Row>
        </Col>
      </Row>
      <Row>
        <Col span={24}>© 2023 Ayahay All rights reserved.</Col>
      </Row>
    </footer>
  );
}
