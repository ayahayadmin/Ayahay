'use client';
import React, { useState } from 'react';
import { Avatar, Button, Dropdown, MenuProps, Modal, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { LoginForm, RegisterForm } from '@ayahay/models';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { User, getAuth } from 'firebase/auth';
import Register from '../form/Register';
import Login from '../form/Login';
import ForgotPassword from '../form/ForgotPassword';
import { useLoggedInAccount } from '@ayahay/hooks/auth';

export default function AuthForm() {
  const auth = getAuth();
  const {
    currentUser,
    emailVerification,
    logout,
    register,
    resetPassword,
    signIn,
  } = useAuth();
  const { loggedInAccount } = useLoggedInAccount();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
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
    setDropdownOpen(false);
  };

  const verifyEmail = async (user: User) => {
    try {
      await emailVerification(user);
      message.success({
        type: 'success',
        content:
          'Email sent! Check your inbox and click the link to verify your email.',
        duration: 5,
      });
    } catch {
      message.error({
        type: 'error',
        content: 'Email failed to send. Please try again later.',
        duration: 5,
      });
    }
  };

  const myProfile = () => {
    setIsProfileModalOpen(true);
    setDropdownOpen(false);
  };

  const onFinishLogin = async (values: LoginForm) => {
    console.log('Received values of form: ', values);
    const { email, password } = values;
    try {
      await signIn(email, password);
      setIsLoginModalOpen(false);
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
      setIsResetModalOpen(false);
      message.success({
        type: 'success',
        content: 'Email sent! Check your inbox to reset your password.',
        duration: 5,
      });
    } else {
      message.error({
        type: 'error',
        content:
          'Email failed to send. Make sure you inputted the correct email address.',
        duration: 5,
      });
    }
  };

  const onFinishRegister = async (values: RegisterForm) => {
    console.log('Received values of register: ', values);
    const { email, password } = values;
    try {
      const uid = await register(email, password, values);
      if (uid) {
        setIsRegisterModalOpen(false);
      }
    } catch (error: any) {
      let content = 'Register account error.';
      const accountExistsError = 'auth/email-already-in-use';
      if (error.message === accountExistsError) {
        content = 'Account already exists.';
      }

      message.error({
        type: 'error',
        content,
        duration: 5,
      });
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
    setIsProfileModalOpen(false);
  };

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <button
          style={{ all: 'unset', width: '100%' }}
          onClick={() => myProfile()}
        >
          My Profile
        </button>
      ),
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

  const label = currentUser
    ? `Welcome, ${
        loggedInAccount?.passenger?.firstName ??
        loggedInAccount?.email.split('@')[0]
      }`
    : 'Log In';
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
          <Avatar icon={<UserOutlined rev={undefined} />} />
        </Button>
      </Dropdown>
      <Modal
        title='Hey there!'
        open={isLoginModalOpen}
        onCancel={onClickCancel}
        footer={null}
        destroyOnClose={true}
      >
        Don't have an account?{' '}
        <Button type='link' onClick={onClickRegister} style={{ padding: 0 }}>
          Register now!
        </Button>
        <Login onFinishLogin={onFinishLogin} onClickReset={onClickReset} />
      </Modal>
      <Modal
        title='Forgot Your Password?'
        open={isResetModalOpen}
        onCancel={onClickCancel}
        footer={null}
        destroyOnClose={true}
      >
        <ForgotPassword
          onFinishReset={onFinishReset}
          onClickBack={onClickBack}
        />
      </Modal>
      <Modal
        title='Register'
        open={isRegisterModalOpen}
        onCancel={onClickCancel}
        footer={null}
        destroyOnClose={true}
      >
        <Register
          onFinishRegister={onFinishRegister}
          onClickBack={onClickBack}
        />
      </Modal>
      <Modal
        title='My Profile'
        open={isProfileModalOpen}
        onCancel={onClickCancel}
        footer={null}
        destroyOnClose={true}
      >
        {auth.currentUser?.emailVerified ? (
          <div>
            <span>{auth.currentUser?.email} is verified</span>
          </div>
        ) : (
          <div>
            <span>
              {auth.currentUser?.email} is not yet verified, please{' '}
              <Link
                href='/'
                onClick={() => verifyEmail(auth.currentUser!)}
                style={{ textDecoration: 'underline' }}
              >
                verify email now
              </Link>
            </span>
          </div>
        )}
      </Modal>
    </div>
  );
}
