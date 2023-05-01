'use client';
import React from 'react';
import styles from './AboutUsCard.module.scss';
import { Col, Row } from 'antd';
import {
  CheckCircleOutlined,
  FieldTimeOutlined,
  PhoneOutlined,
} from '@ant-design/icons';

export default function AboutUsCard() {
  return (
    <div className={styles.containerFluid}>
      <h1 className={styles.title}>Why Choose Us</h1>
      <sub className={styles.subTitle}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      </sub>
      <Row className={styles.rowCard}>
        <Col span={8} className={styles.card}>
          <CheckCircleOutlined className={styles.icon} />
          <h3 className={styles.title}>Best Price Guarantee</h3>
          <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</span>
        </Col>
        <Col span={8} className={styles.card}>
          <FieldTimeOutlined className={styles.icon} />
          <h3 className={styles.title}>Easy & Quick Booking</h3>
          <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</span>
        </Col>
        <Col span={8} className={styles.card}>
          <PhoneOutlined className={styles.icon} />
          <h3 className={styles.title}>Customer Care 24/7</h3>
          <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</span>
        </Col>
      </Row>
    </div>
  );
}
