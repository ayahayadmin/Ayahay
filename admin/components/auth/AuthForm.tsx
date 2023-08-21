'use client';
import React, { useState } from 'react';
import { Avatar, Button, Dropdown, Form, Input, MenuProps, Modal } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { LoginForm } from '@ayahay/models';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import axios from 'axios';
import { ACCOUNT_API } from '@ayahay/constants';

export default function AuthForm() {
  const { currentUser, logout, resetPassword, signIn } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownLabel, setDropdownLabel] = useState('');

  const onClick = () => {
    if (!currentUser) {
      logIn();
    } else {
      setDropdownOpen(!dropdownOpen);
    }
  };

  const logIn = () => {
    setIsLoginModalOpen(true);
  };

  const logOut = () => {
    logout();
    setDropdownOpen(false);
    setDropdownLabel('');
  };

  const onFinishLogin = async (values: LoginForm) => {
    console.log('Received values of form: ', values);
    const { email, password } = values;
    try {
      const userId = await signIn(email, password);
      axios
        .get(`${ACCOUNT_API}/${userId}`)
        .then(({ data }) => {
          setDropdownLabel(data.email.split('@')[0]);
        })
        .catch((error) => {
          console.error('Axios Error', error.message);
        });
      setIsLoginModalOpen(false);
    } catch (error) {
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
    setIsLoginModalOpen(false);
    setIsResetModalOpen(true);
  };

  const onClickBack = () => {
    setIsResetModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const onClickCancel = () => {
    setIsLoginModalOpen(false);
    setIsResetModalOpen(false);
  };

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: <Link href='/'>My Profile</Link>,
    },
    {
      key: '2',
      label: (
        <button
          style={{ all: 'unset', width: '100%' }}
          onClick={() => logOut()}
        >
          Log Out
        </button>
      ),
    },
  ];

  const label = currentUser ? `Welcome, ${dropdownLabel}` : 'Log In';
  return (
    <div>
      <Dropdown menu={{ items }} open={!!currentUser && dropdownOpen}>
        <Button
          type='text'
          size='large'
          style={{ height: 'auto' }}
          onClick={onClick}
        >
          <span style={{ marginRight: '12px', fontSize: '14px' }}>{label}</span>
          <Avatar icon={<UserOutlined />} />
        </Button>
      </Dropdown>
      <Modal
        title='Login'
        open={isLoginModalOpen}
        onCancel={onClickCancel}
        footer={null}
        destroyOnClose={true}
      >
        <Form
          name='normal_login'
          className='login-form'
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

          <Form.Item>
            <Button
              type='primary'
              htmlType='submit'
              className='login-form-button'
            >
              Log in
            </Button>
          </Form.Item>
        </Form>
      </Modal>
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
            <Button key='back' onClick={onClickBack}>
              Back
            </Button>
            <Button type='primary' htmlType='submit'>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
