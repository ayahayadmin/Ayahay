'use client';
import React, { useState } from 'react';
import { Button, Form, Input } from 'antd';
import { LoginForm } from '@ayahay/models/profile.model';
import { onLogin } from '@/services/profile.service';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';

// const formItemLayout = {
//   labelCol: {
//     xs: { span: 24 },
//     sm: { span: 8 },
//   },
//   wrapperCol: {
//     xs: { span: 24 },
//     sm: { span: 16 },
//   },
// };

export default function SignInForm() {
  const { currentUser, signIn } = useAuth();
  const [error, setError] = useState('');
  const router = useRouter();

  if (currentUser) {
    console.log(`currentUser: ${JSON.stringify(currentUser, null, 2)}`);
    router.push('/'); //altho if magmomodal, iclclose na lang yung modal instead of redirection
  }

  const onFinish = (values: LoginForm) => {
    console.log('Received values of form: ', values);
    const { email, password } = values;
    signIn(email, password);
    // try {
    //   const profile = onLogin(values);
    //   console.log(profile);
    // } catch (e) {
    //   console.log(e);
    //   setError('Invalid E-mail or Password');
    // }
  };

  // const onReset = () => {

  // }

  return (
    <Form
      // {...formItemLayout}
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
        <a className='login-form-forgot' onClick={() => {}} href=''>
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
