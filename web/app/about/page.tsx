'use client';
import { Card, Typography } from 'antd';
import styles from './page.module.scss';

const { Title } = Typography;

export default function AboutUs() {
  return (
    <div className={styles['main-container']}>
      <Title level={3}>Who Are We</Title>
      <div className={styles['cards']}>
        <Card
          hoverable
          style={{ width: 240, margin: '5px' }}
          cover={
            <img
              alt='example'
              src='https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png'
            />
          }
        >
          <p>
            <strong>Jay Mark Engalla</strong>
          </p>
          <p>Chief Executive Officer</p>
        </Card>
        <Card
          hoverable
          style={{ width: 240, margin: '5px' }}
          cover={
            <img
              alt='example'
              src='https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png'
            />
          }
        >
          <p>
            <strong>Josef Arroyo</strong>
          </p>
          <p>Chief Operating Officer</p>
        </Card>
        <Card
          hoverable
          style={{ width: 240, margin: '5px' }}
          cover={
            <img
              alt='example'
              src='https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png'
            />
          }
        >
          <p>
            <strong>Mari Tonee Atil</strong>
          </p>
          <p>Chief Financial Officer</p>
        </Card>
      </div>
      <div className={styles['cards']}>
        <Card
          hoverable
          style={{ width: 240, margin: '5px' }}
          cover={
            <img
              alt='example'
              src='https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png'
            />
          }
        >
          <p>
            <strong>James Atil</strong>
          </p>
          <p>Chief Risk Officer</p>
        </Card>
        <Card
          hoverable
          style={{ width: 240, margin: '5px' }}
          cover={<img alt='example' src='/assets/carlos-ngo.jpg' />}
        >
          <p>
            <strong>Carlos Ngo</strong>
          </p>
          <p>Chief Technology Officer</p>
        </Card>
        <Card
          hoverable
          style={{ width: 240, margin: '5px' }}
          cover={<img alt='example' src='/assets/chester-sy.jpg' />}
        >
          <p>
            <strong>Chester Nevan Sy</strong>
          </p>
          <p>Chief Product Officer</p>
        </Card>
      </div>
    </div>
  );
}
