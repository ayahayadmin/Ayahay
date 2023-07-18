'use client';
import { BasicProfile } from '@ayahay/models/profile.model';
import { saveProfile } from '@/services/profile.service';
import { Button, Checkbox, Form, Input } from 'antd';
import React, { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

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

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};

export default function Register() {
  const { currentUser, register } = useAuth();
  const [form] = Form.useForm();

  const onFinish = (values: BasicProfile) => {
    console.log('Received values of form: ', values);
    const { email, password } = values;
    register(email, password);
    // saveProfile(values);
  };

  return (
    <Form
      {...formItemLayout}
      form={form}
      name='register'
      onFinish={onFinish}
      style={{ maxWidth: 600 }}
      scrollToFirstError
    >
      <Form.Item
        name='firstName'
        label='First Name'
        rules={[
          {
            required: true,
            message: 'Please input your first name!',
            whitespace: true,
          },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name='lastName'
        label='Last Name'
        rules={[
          {
            required: true,
            message: 'Please input your last name!',
            whitespace: true,
          },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name='email'
        label='E-mail'
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
        <Input />
      </Form.Item>

      <Form.Item
        name='password'
        label='Password'
        rules={[
          {
            required: true,
            message: 'Please input your password!',
          },
        ]}
        hasFeedback
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        name='confirm'
        label='Confirm Password'
        dependencies={['password']}
        hasFeedback
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
                new Error('The two passwords that you entered do not match!')
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
        {...tailFormItemLayout}
      >
        <Checkbox>
          Agree with the <a href=''>Terms of Service</a>
        </Checkbox>
      </Form.Item>
      <Form.Item {...tailFormItemLayout}>
        <Button type='primary' htmlType='submit'>
          Register
        </Button>
      </Form.Item>
    </Form>
  );
}
