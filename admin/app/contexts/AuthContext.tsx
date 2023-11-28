import {
  User,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { firebase } from '../utils/initFirebase';
import { useIdToken } from 'react-firebase-hooks/auth';
import { accountRelatedCacheKeys } from '@ayahay/constants';
import { cacheItem, invalidateItem } from '@ayahay/services/cache.service';
import { IAccount } from '@ayahay/models';
import { getAccountInformation } from '@ayahay/services/account.service';

const AuthContext = createContext({
  currentUser: null as User | undefined | null,
  // loggedInAccount is null if it's loading
  loggedInAccount: null as IAccount | undefined | null,
  signIn: (email: string, password: string) => Promise,
  logout: () => Promise,
  resetPassword: (email: string) => Promise,
});

export const useAuth = () => useContext(AuthContext);

export default function AuthContextProvider({ children }: any) {
  const [currentUser, loading] = useIdToken(firebase);
  const [loggedInAccount, setLoggedInAccount] = useState<
    IAccount | undefined | null
  >(null);

  useEffect(() => {
    if (loading) {
      return;
    }
    fetchAccountInformation();
  }, [currentUser, loading]);

  const fetchAccountInformation = async () => {
    if (currentUser) {
      // force refresh so that user claims (with role) is always updated on login
      const jwt = await currentUser.getIdToken(true);
      cacheItem('jwt', jwt);
      const myAccountInformation = await getAccountInformation();
      setLoggedInAccount(myAccountInformation);
    } else {
      invalidateItem('jwt');
      setLoggedInAccount(undefined);
    }
  };

  function signIn(email: string, password: string): Promise<string> {
    return signInWithEmailAndPassword(firebase, email, password)
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
    return sendPasswordResetEmail(firebase, email, {
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
    return signOut(firebase)
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
    loggedInAccount,
    signIn,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
