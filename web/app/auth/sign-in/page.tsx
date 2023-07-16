'use client';
import React from 'react';
import SignInForm from '@/components/auth/SignInForm';
import { initFirebase } from '../app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default function SignIn() {
  initFirebase();
  // console.log(app);
  const googleProvider = new GoogleAuthProvider();
  const auth = getAuth();

  const signInWithEmailAndPassword = async () => {
    const result = await signInWithEmailAndPassword();
  };

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    console.log(result.user);
  };

  return (
    <div>
      <SignInForm />
      <button onClick={signInWithGoogle}>Google Sign In</button>
    </div>
  );
}
