'use client';
import React from 'react';
import styles from './AboutUsCard.module.scss';
import { Card, Col, Row, Space } from 'antd';

export default function AboutUsCard() {
  return (
    <div>
      <Space
        direction="vertical"
        size="middle"
        className={styles.containerFluid}
      >
        <h1>Why Choose Us</h1>
        <sub>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</sub>
        <Row gutter={16}>
          <Col span={8}>
            <Card title="Card title" bordered={false}>
              Card content
            </Card>
          </Col>
          <Col span={8}>
            <Card title="Card title" bordered={false}>
              Card content
            </Card>
          </Col>
          <Col span={8}>
            <Card title="Card title" bordered={false}>
              Card content
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
}
