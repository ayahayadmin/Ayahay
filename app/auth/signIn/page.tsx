'use client';
import React, { useState } from 'react';
import { Button, Form, Input } from 'antd';
import { LoginForm } from '@/common/models/profile.model';
import { onLogin } from '@/common/services/profile.service';

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

export default function SignIn() {
  const [error, setError] = useState('');

  const onFinish = (values: LoginForm) => {
    console.log('Received values of form: ', values);
    try {
      const profile = onLogin(values);
      console.log(profile);
    } catch (e) {
      console.log(e);
      setError('Invalid E-mail or Password');
    }
  };

  return (
    <Form
      {...formItemLayout}
      name='normal_login'
      className='login-form'
      onFinish={onFinish}
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
        <a className='login-form-forgot' href=''>
          Forgot password?
        </a>
      </Form.Item>

      {error && <span>{error}</span>}

      <Form.Item>
        <Button type='primary' htmlType='submit' className='login-form-button'>
          Log in
        </Button>
        <Button
          href='/auth/register'
          type='primary'
          htmlType='submit'
          className='login-form-button'
        >
          Register
        </Button>
      </Form.Item>
    </Form>
  );
}
