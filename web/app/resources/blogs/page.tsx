'use client';
import { Typography } from 'antd';
import styles from './page.module.scss';

const { Title } = Typography;

export default function Blogs() {
  return (
    <div className={styles['main-container']}>
      <Title level={1} style={{ fontSize: 30, marginBottom: 5 }}>
        Talks about how we closed the deal with E.B. Aznar Shipping Corporation
      </Title>
      <img
        className={styles['image']}
        alt='aznar deal'
        src='/assets/aznar-deal.jpg'
      />
    </div>
  );
}
