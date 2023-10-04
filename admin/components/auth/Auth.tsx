'use client';
import React, { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { Button, Form, Input, Modal, Spin, message } from 'antd';
import { LoginForm } from '@ayahay/models';
import styles from './auth.module.scss';
import { useAuthState } from '@/hooks/auth';
import { useRouter } from 'next/navigation';

export default function Login() {
  const { pending, isSignedIn, user, auth } = useAuthState();
  const { resetPassword, signIn } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  if (pending) {
    return <Spin size='large' className={styles['spinner']} />;
  }

  if (isSignedIn) {
    router.push('/trips');
  }

  const onFinishLogin = async (values: LoginForm) => {
    console.log('Received values of form: ', values);
    const { email, password } = values;
    try {
      await signIn(email, password);
      router.push('/trips');
    } catch (error) {
      message.error({
        type: 'error',
        content: 'E-mail or password is incorrect.',
        duration: 5,
      });
      console.error(error);
    }
  };

  const onFinishReset = async (values: LoginForm) => {
    console.log('Received values of reset: ', values);
    const { email } = values;
    const result = await resetPassword(email);
    if (result) {
      setIsResetModalOpen(false); //show pop up that email is sent
    }
  };

  const onClickReset = () => {
    setIsResetModalOpen(true);
  };

  const onClickCancel = () => {
    setIsResetModalOpen(false);
  };

  return (
    <>
      <div className={styles['login-container']}>
        <Form
          name='normal_login'
          className={styles['login-form']}
          onFinish={onFinishLogin}
        >
          <Form.Item
            label='E-mail:'
            name='email'
            rules={[
              {
                type: 'email',
                message: 'The input is not valid E-mail!',
              },
              {
                required: true,
                message: 'Please input your E-mail!',
              },
            ]}
          >
            <Input onFocus={() => setError('')} placeholder='Enter email' />
          </Form.Item>
          <Form.Item
            label='Password:'
            name='password'
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input.Password
              onFocus={() => setError('')}
              type='password'
              placeholder='Enter password'
            />
          </Form.Item>
          <Form.Item>
            <a className='login-form-forgot' onClick={onClickReset}>
              Forgot password?
            </a>
          </Form.Item>

          {error && <span>{error}</span>}

          <Form.Item className={styles['login-form-button']}>
            <Button type='primary' htmlType='submit' className='login-button'>
              Log in
            </Button>
          </Form.Item>
        </Form>
      </div>
      <div>
        <Modal
          title='Forgot Your Password?'
          open={isResetModalOpen}
          onCancel={onClickCancel}
          footer={null}
          destroyOnClose={true}
        >
          <Form
            name='forgot_password'
            className='forgot-password-form'
            onFinish={onFinishReset}
          >
            <Form.Item
              label='E-mail:'
              name='email'
              rules={[
                {
                  type: 'email',
                  message: 'The input is not valid E-mail!',
                },
                {
                  required: true,
                  message: 'Please input your E-mail!',
                },
              ]}
            >
              <Input onFocus={() => setError('')} placeholder='Enter email' />
            </Form.Item>

            {error && <span>{error}</span>}

            <Form.Item>
              <Button key='back' onClick={onClickCancel}>
                Back
              </Button>
              <Button type='primary' htmlType='submit'>
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
}
