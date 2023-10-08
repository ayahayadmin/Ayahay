import {
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { createContext, useContext } from 'react';
import { initFirebase } from '../utils/initFirebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { accountRelatedCacheKeys } from '@ayahay/constants';
import { invalidateItem } from '@ayahay/services/cache.service';

initFirebase();
export const auth = getAuth();
const AuthContext = createContext({
  currentUser: null,
  signIn: (email: string, password: string) => Promise,
  logout: () => Promise,
  resetPassword: (email: string) => Promise,
});

export const useAuth = () => useContext(AuthContext);

export default function AuthContextProvider({ children }: any) {
  const [currentUser, loading] = useAuthState(auth);

  function signIn(email: string, password: string): Promise<string> {
    return signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log(`success sign in`);
        return user.uid;
      })
      .catch((error) => {
        throw new Error(`sign in error`);
      });
  }

  function resetPassword(email: string) {
    return sendPasswordResetEmail(auth, email, {
      url: process.env.NEXT_PUBLIC_ADMIN_URL ?? 'https://www.admin.ayahay.com',
    })
      .then((res) => {
        // Reset successful.
        console.log(`reset success`);
        return true;
      })
      .catch((error) => {
        throw new Error('reset error');
      });
  }

  function logout() {
    return signOut(auth)
      .then(() => {
        // Sign-out successful.
        for (const accountRelatedCacheKey of accountRelatedCacheKeys) {
          invalidateItem(accountRelatedCacheKey);
        }
      })
      .catch((error) => {
        throw new Error('sign out error');
      });
  }

  const value = {
    currentUser,
    signIn,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
