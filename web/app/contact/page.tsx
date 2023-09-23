'use client';
import { Button, Form, Input, Typography } from 'antd';
import styles from './page.module.scss';
import { useState } from 'react';
import { MailOutlined, PhoneOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { TextArea } = Input;

export default function Contact() {
  const [emailBody, setEmailBody] = useState('');
  const [emailName, setEmailName] = useState('');

  const onFinish = (values: any) => {
    const { name, email, message } = values;
    //TO DO: send email
  };

  return (
    <div className={styles['main-container']}>
      <Title level={1} style={{ fontSize: 30, marginBottom: 5 }}>
        Contact us
      </Title>
      <p>Want to get in touch? Send us a message and we'll get back to you.</p>
      <Form name='contact_form' onFinish={onFinish} style={{ maxWidth: 600 }}>
        <div className={styles['name-email']}>
          <Form.Item
            name='name'
            className={styles['name']}
            rules={[{ required: true, message: 'Please input your name' }]}
          >
            <Input
              value={emailName}
              onChange={(e) => setEmailName(e.target.value)}
              placeholder='Name'
            />
          </Form.Item>
          <Form.Item
            name='email'
            className={styles['email']}
            rules={[
              {
                type: 'email',
                message: 'The input is not valid E-mail!',
              },
              { required: true, message: 'Please input your email' },
            ]}
          >
            <Input placeholder='Email' />
          </Form.Item>
        </div>
        <Form.Item
          name='message'
          rules={[{ required: true, message: 'Please input an email message' }]}
        >
          <TextArea
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
            placeholder='Type your message here'
            autoSize={{ minRows: 3, maxRows: 5 }}
          />
        </Form.Item>
        <Form.Item>
          <Button
            type='primary'
            htmlType='submit'
            href={`mailto:admin@ayahay.com?subject=${emailName} Ayahay Inquiry&body=${emailBody}`}
          >
            Send
          </Button>
        </Form.Item>
      </Form>
      <p>You may also directly reach out to us via:</p>
      <div className={styles['contact']}>
        <PhoneOutlined rev={undefined} /> Phone: (032) 517 4255
      </div>
      <div className={styles['contact']}>
        <MailOutlined rev={undefined} /> Email: admin@ayahay.com
      </div>
    </div>
  );
}
