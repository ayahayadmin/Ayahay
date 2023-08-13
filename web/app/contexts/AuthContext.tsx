import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { createContext, useContext, useState } from 'react';
import { initFirebase } from '../utils/initFirebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { AUTH_API } from '@ayahay/constants';

initFirebase();
const auth = getAuth();
const AuthContext = createContext({
  currentUser: null,
  register: (email: string, password: string) => Promise,
  signIn: (email: string, password: string) => Promise,
  signInWithGoogle: () => Promise,
  logout: () => Promise,
  resetPassword: (email: string) => Promise,
});

export const useAuth = () => useContext(AuthContext);

export default function AuthContextProvider({ children }: any) {
  const [currentUser, loading] = useAuthState(auth);

  function register(email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log(`success register: ${JSON.stringify(user, null, 2)}`);

        const token = await user.getIdToken();
        return fetch(`${AUTH_API}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token,
          },
          body: JSON.stringify({
            token,
          }),
        });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(`register in error: ${errorCode}: ${errorMessage}`); //maybe throw an error
      });
  }

  function signIn(email: string, password: string): Promise<string> {
    return signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log(`success sign in: ${JSON.stringify(user, null, 2)}`);
        return user.uid;
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        throw new Error(`sign in error: ${errorCode}: ${errorMessage}`);
      });
  }

  function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }

  function resetPassword(email: string) {
    return sendPasswordResetEmail(auth, email, { url: 'http://localhost:3000' }) //TO DO: localhost would be changed ofc
      .then((res) => {
        // Reset successful.
        console.log(`reset success: ${JSON.stringify(res, null, 2)}`);
        return true;
      })
      .catch((error) => {
        // An error happened.
        console.log(`reset error: ${error.message}`); //maybe throw an error
      });
  }

  function logout() {
    return signOut(auth)
      .then(() => {
        // Sign-out successful.
        console.log('sign out success');
      })
      .catch((error) => {
        // An error happened.
        console.log('sign out error'); //maybe throw an error
      });
  }

  const value = {
    currentUser,
    register,
    signIn,
    logout,
    signInWithGoogle,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
