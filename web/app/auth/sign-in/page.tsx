'use client';
import React from 'react';
import SignInForm from '@/components/auth/SignInForm';
import { useAuth } from '@/app/contexts/AuthContext';

export default function SignIn() {
  const { currentUser, signInWithGoogle } = useAuth();

  return (
    <div>
      <SignInForm />
      <button onClick={signInWithGoogle}>Google Sign In</button>
    </div>
  );
}
