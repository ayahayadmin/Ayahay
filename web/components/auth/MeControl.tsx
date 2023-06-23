'use client';
import React, { useState } from 'react';
import { Avatar, Button, Dropdown, MenuProps } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { IProfile } from '@ayahay/models';
import Link from 'next/link';

export default function MeControl() {
  const [loggedInUser, setLoggedInUser] = useState<IProfile | undefined>(
    undefined
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const onClick = () => {
    if (loggedInUser === undefined) {
      logIn();
    } else {
      setDropdownOpen(!dropdownOpen);
    }
  };

  const logIn = () => {
    setLoggedInUser({
      firstName: 'Carlos',
      lastName: '',
      mobileNumber: '',
      nationality: '',
      password: '',
      role: 'Admin',
      sex: 'Male',
    });
  };

  const logOut = () => {
    setLoggedInUser(undefined);
    setDropdownOpen(false);
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

  const label = loggedInUser ? loggedInUser.firstName : 'Log In';
  return (
    <Dropdown
      menu={{ items }}
      open={loggedInUser !== undefined && dropdownOpen}
    >
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
  );
}
