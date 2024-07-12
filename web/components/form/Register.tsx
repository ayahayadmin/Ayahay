import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  Steps,
} from 'antd';
import EnumSelect from '@ayahay/components/form/EnumSelect';
import { SEX } from '@ayahay/constants';
import { buttonStyle } from './Login';
import { useState } from 'react';
import { InfoCircleOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { RangePickerProps } from 'antd/es/date-picker';

interface RegisterProps {
  onFinishRegister: (values: any) => Promise<void>;
  onClickBack: () => void;
}

const steps = [
  { title: 'Account Info', icon: <UserOutlined /> },
  { title: 'Passenger Info', icon: <InfoCircleOutlined /> },
];

export default function Register({
  onFinishRegister,
  onClickBack,
}: RegisterProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();

  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    return current > dayjs().endOf('day');
  };

  const checkValues = async () => {
    try {
      await form.validateFields([
        'email',
        'confirmEmail',
        'password',
        'confirmPassword',
        'agreement',
      ]);
      nextStep();
    } catch (e) {
      console.error(e);
    }
  };

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const previousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const items = steps.map(({ title, icon }) => ({ key: title, title, icon }));

  return (
    <Form
      form={form}
      name='normal-register'
      className='register-form'
      onFinish={onFinishRegister}
    >
      <Steps current={currentStep} items={items} style={{ marginBottom: 15 }} />
      <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
        <Form.Item
          label='E-mail:'
          name='email'
          rules={[
            {
              type: 'email',
              message: 'The input is not valid e-mail',
            },
            {
              required: true,
              message: 'Please input your e-mail',
            },
          ]}
          validateTrigger='onBlur'
        >
          <Input placeholder='Enter e-mail' />
        </Form.Item>
        <Form.Item
          label='Confirm e-mail:'
          name='confirmEmail'
          dependencies={['email']}
          rules={[
            {
              type: 'email',
              message: 'The input is not valid e-mail',
            },
            {
              required: true,
              message: 'Please confirm your e-mail',
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('email') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error('The two e-mails that you entered do not match!')
                );
              },
            }),
          ]}
          validateTrigger='onBlur'
        >
          <Input placeholder='Re-enter e-mail' />
        </Form.Item>
        <Form.Item
          label='Password:'
          name='password'
          rules={[
            { required: true, message: 'Please input your password' },
            {
              min: 8,
              message: 'Password cannot be less than 8 characters',
            },
          ]}
          validateTrigger='onBlur'
        >
          <Input.Password type='password' placeholder='Enter password' />
        </Form.Item>
        <Form.Item
          label='Confirm password'
          name='confirmPassword'
          dependencies={['password']}
          rules={[
            {
              required: true,
              message: 'Please confirm your password',
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
          validateTrigger='onBlur'
        >
          <Input.Password placeholder='Re-enter password' />
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
          validateTrigger='onBlur'
        >
          <Checkbox>
            Agree with the <a href=''>Terms of Service</a>
          </Checkbox>
        </Form.Item>
        <Form.Item>
          <Button key='back' onClick={onClickBack} style={buttonStyle}>
            Back
          </Button>
          <Button type='primary' onClick={checkValues} style={buttonStyle}>
            Next
          </Button>
        </Form.Item>
      </div>

      <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
        <Form.Item
          label='First Name:'
          name='firstName'
          rules={[
            {
              required: true,
              message: 'Please input your first name',
            },
          ]}
        >
          <Input placeholder='Enter first name' />
        </Form.Item>
        <Form.Item
          label='Last Name:'
          name='lastName'
          rules={[
            {
              required: true,
              message: 'Please input your last name',
            },
          ]}
        >
          <Input placeholder='Enter last name' />
        </Form.Item>
        <EnumSelect
          _enum={SEX}
          disabled={false}
          label='Sex:'
          name='sex'
          rules={[
            {
              required: true,
              message: 'Please choose your sex',
            },
          ]}
        />
        <Form.Item
          label='Birthday:'
          name='birthday'
          rules={[
            {
              required: true,
              message: 'Please input your birthday',
            },
          ]}
        >
          <DatePicker style={{ width: '100%' }} disabledDate={disabledDate} />
        </Form.Item>
        <Form.Item
          label='Address:'
          name='address'
          rules={[
            {
              required: true,
              message: 'Please input your address',
            },
          ]}
        >
          <Input placeholder='Enter address' />
        </Form.Item>
        <Form.Item
          label='Nationality:'
          name='nationality'
          rules={[
            {
              required: true,
              message: 'Please input your nationality',
            },
          ]}
        >
          <Input placeholder='Enter nationality' />
        </Form.Item>
        <Form.Item>
          <Button key='back' onClick={previousStep} style={buttonStyle}>
            Back
          </Button>
          <Button type='primary' htmlType='submit' style={buttonStyle}>
            Submit
          </Button>
        </Form.Item>
      </div>
    </Form>
  );
}
