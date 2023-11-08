'use client';
import { useAuthState } from '@/hooks/auth';
import { Spin } from 'antd';
import { redirect } from 'next/navigation';
import styles from './page.module.scss';
import { useAuth } from '../contexts/AuthContext';

export default function Reporting() {
  const { loggedInAccount } = useAuth();
  const { pending, isSignedIn, user, auth } = useAuthState();

  if (pending) {
    return <Spin size='large' className={styles['spinner']} />;
  }

  const allowedRoles = ['SuperAdmin', 'Admin'];
  if (!isSignedIn) {
    redirect('/');
  } else if (loggedInAccount && !allowedRoles.includes(loggedInAccount.role)) {
    redirect('/403');
  }

  return <h1>reporting page</h1>;
}
