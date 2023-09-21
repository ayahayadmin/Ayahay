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
          className={styles['card']}
          cover={
            <img
              alt='example'
              className={styles['image']}
              src='/assets/jay-engalla.jpg'
            />
          }
          onClick={() => {
            window.open(
              'https://www.linkedin.com/in/jay-mark-engalla-537210b8/',
              '_blank'
            );
          }}
        >
          <p>
            <strong>Jay Mark Engalla</strong>
          </p>
          <p>Chief Executive Officer</p>
        </Card>
        <Card
          hoverable
          className={styles['card']}
          cover={
            <img
              alt='example'
              className={styles['image']}
              src='/assets/josef-arroyo.jpg'
            />
          }
          onClick={() => {
            window.open(
              'https://www.linkedin.com/in/josef-michael-arroyo-jmja007/',
              '_blank'
            );
          }}
        >
          <p>
            <strong>Josef Michael Arroyo</strong>
          </p>
          <p>Chief Operating Officer</p>
        </Card>
        <Card
          hoverable
          className={styles['card']}
          cover={
            <img
              alt='example'
              className={styles['image']}
              src='/assets/tonee-atil.jpg'
            />
          }
          onClick={() => {
            window.open(
              'https://www.linkedin.com/in/tonee-pacres-atil-92b3a3292/',
              '_blank'
            );
          }}
        >
          <p>
            <strong>Tonee Pacres-Atil</strong>
          </p>
          <p>Chief Financial Officer</p>
        </Card>
        {/* </div>
      <div className={styles['cards']}> */}
        <Card
          hoverable
          className={styles['card']}
          cover={
            <img
              alt='example'
              className={styles['image']}
              src='/assets/james-atil.jpg'
            />
          }
          onClick={() => {
            window.open('https://www.linkedin.com/in/jamesatil/', '_blank');
          }}
        >
          <p>
            <strong>James Atil</strong>
          </p>
          <p>Chief Risk Officer</p>
        </Card>
        <Card
          hoverable
          className={styles['card']}
          cover={
            <img
              alt='example'
              className={styles['image']}
              src='/assets/carlos-ngo.jpg'
            />
          }
          onClick={() => {
            window.open('https://www.linkedin.com/in/carlosngo/', '_blank');
          }}
        >
          <p>
            <strong>Carlos Ngo</strong>
          </p>
          <p>Chief Technology Officer</p>
        </Card>
        <Card
          hoverable
          className={styles['card']}
          cover={
            <img
              alt='example'
              className={styles['image']}
              src='/assets/chester-sy.jpg'
            />
          }
          onClick={() => {
            window.open(
              'https://www.linkedin.com/in/chester-nevan-sy/',
              '_blank'
            );
          }}
        >
          <p>
            <strong>Chester Nevan Sy</strong>
          </p>
          <p>Chief Product Officer</p>
        </Card>
      </div>
      <Title level={3} className={styles['title']}>
        About Us
      </Title>
      <div>
        <p>
          Welcome to Ayahay, where innovation meets expertise in the world of
          logistics and technology. We are a dynamic and forward-thinking
          company founded by individuals with a wealth of experience in the IT
          and logistics industry. Our journey began with a shared vision: to
          revolutionize the way logistics and transportation are managed and
          experienced in the Philippines.
        </p>
      </div>
      <Title level={3} className={styles['title']}>
        Our Story
      </Title>
      <div>
        <p>
          Ayahay was born out of a deep understanding of the challenges faced by
          the shipping and logistics industry in adapting to the digital age.
          The founders of Ayahay brought together their extensive knowledge and
          experience in IT and logistics to create a solution that would bridge
          the gap between traditional practices and modern technology.
        </p>
      </div>
      <Title level={3} className={styles['title']}>
        Expertise in IT Logistics
      </Title>
      <div>
        <p>
          Our team comprises experts who have spent years working at the
          intersection of information technology and logistics. We understand
          the intricacies of supply chain management, fleet operations, and
          passenger services. This expertise has allowed us to design and
          develop innovative solutions that address the unique needs of the
          logistics and shipping industry.
        </p>
      </div>
      <Title level={3} className={styles['title']}>
        Mission
      </Title>
      <div>
        <p>
          Our mission is to empower businesses in the shipping line industry to
          adapt to advanced technology and digitization. We aim to make it
          easier for businesses to manage their fleets and enhance the sea
          travel experience for passengers, saving them time and ensuring a
          hassle-free journey.
        </p>
      </div>
      <Title level={3} className={styles['title']}>
        Vision
      </Title>
      <div>
        <p>
          At Ayahay, we envision a future where the shipping line industry in
          the Philippines fully embraces technology, becoming digitally
          connected and customer-centric. We aim to lead the way in
          revolutionizing sea travel by providing a user-friendly platform that
          simplifies booking, enhances communication, and ensures stress-free
          journeys for passengers.
        </p>
      </div>
    </div>
  );
}
