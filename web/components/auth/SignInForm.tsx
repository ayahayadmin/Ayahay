'use client';
import React, { useState } from 'react';
import {
  Avatar,
  Button,
  Checkbox,
  Dropdown,
  Form,
  Input,
  MenuProps,
  Modal,
} from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { LoginForm } from '@ayahay/models';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';

export default function SignInForm() {
  const { currentUser, logout, register, resetPassword, signIn } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
    // setLoggedInUser(undefined);
    setDropdownOpen(false);
  };

  const onFinishLogin = async (values: LoginForm) => {
    console.log('Received values of form: ', values);
    const { email, password } = values;
    const result = await signIn(email, password);
    if (result) {
      setIsLoginModalOpen(false);
    }
    // try {
    //   const profile = onLogin(values);
    //   console.log(profile);
    // } catch (e) {
    //   console.log(e);
    //   setError('Invalid E-mail or Password');
    // }
  };

  const onFinishReset = async (values: LoginForm) => {
    console.log('Received values of reset: ', values);
    const { email } = values;
    const result = await resetPassword(email);
    if (result) {
      setIsResetModalOpen(false); //show pop up that email is sent
    }
  };

  const onFinishRegister = async (values: any) => {
    console.log('Received values of register: ', values);
    const { email, password } = values;
    const result = await register(email, password);
    if (result) {
      setIsRegisterModalOpen(false);
    }
  };

  const onClickReset = () => {
    setIsLoginModalOpen(false);
    setIsResetModalOpen(true);
  };

  const onClickRegister = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(true);
  };

  const onClickBack = () => {
    setIsResetModalOpen(false);
    setIsRegisterModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const onClickCancel = () => {
    setIsLoginModalOpen(false);
    setIsResetModalOpen(false);
    setIsRegisterModalOpen(false);
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

  const label = currentUser ? 'Welcome' : 'Log In';
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
            <Button
              type='primary'
              htmlType='submit'
              className='register-button'
              onClick={onClickRegister}
            >
              Register
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
      <Modal
        title='Register'
        open={isRegisterModalOpen}
        onCancel={onClickCancel}
        footer={null}
        destroyOnClose={true}
      >
        <Form
          name='normal_register'
          className='register-form'
          onFinish={onFinishRegister}
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
          <Form.Item
            name='confirm'
            label='Confirm Password'
            dependencies={['password']}
            rules={[
              {
                required: true,
                message: 'Please confirm your password!',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(
                      'The two passwords that you entered do not match!'
                    )
                  );
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name='agreement'
            valuePropName='checked'
            rules={[
              {
                validator: (_, value) =>
                  value
                    ? Promise.resolve()
                    : Promise.reject(new Error('Should accept agreement')),
              },
            ]}
          >
            <Checkbox>
              Agree with the <a href=''>Terms of Service</a>
            </Checkbox>
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
