'use client';
import React, { useState } from 'react';
import { Avatar, Button, Dropdown, MenuProps } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { useLoggedInAccount } from '@ayahay/hooks/auth';
import { useAuthState } from '@/hooks/auth';

export default function Logout() {
  const { currentUser, logout } = useAuth();
  const { loggedInAccount } = useLoggedInAccount();
  const { pending } = useAuthState();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const logOut = () => {
    logout();
    setDropdownOpen(false);
  };

  const items: MenuProps['items'] = [
    {
      key: '1',
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

  const label = !pending
    ? `Welcome, ${
        loggedInAccount?.passenger?.firstName ??
        loggedInAccount?.email.split('@')[0]
      }`
    : '';
  return (
    <div>
      <Dropdown menu={{ items }} open={!!currentUser && dropdownOpen}>
        <Button
          type='text'
          size='large'
          style={{ height: 'auto' }}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <span style={{ marginRight: '12px', fontSize: '14px' }}>{label}</span>
          <Avatar icon={<UserOutlined rev={undefined} />} />
        </Button>
      </Dropdown>
    </div>
  );
}
