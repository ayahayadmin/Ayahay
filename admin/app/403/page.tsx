'use client';
import { useAuthState } from '@/hooks/auth';
import { Spin } from 'antd';
import { redirect } from 'next/navigation';
import styles from './page.module.scss';

export default function Unauthorized() {
  const { pending, isSignedIn } = useAuthState();

  if (pending) {
    return <Spin size='large' className={styles['spinner']} />;
  }

  if (!isSignedIn) {
    redirect('/');
  }

  return (
    <div>
      <h2>Error 403 - Forbidden</h2>
      <h1>Access to this resource is denied!</h1>
    </div>
  );
}
