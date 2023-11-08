import {
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { firebase } from '../utils/initFirebase';
import { useIdToken } from 'react-firebase-hooks/auth';
import { verifyToken } from '@/services/auth.service';
import { invalidateItem } from '@ayahay/services/cache.service';
import { accountRelatedCacheKeys } from '@ayahay/constants';
import { IAccount, RegisterForm } from '@ayahay/models';
import {
  createPassenger,
  mapPassengerToDto,
} from '@/services/passenger.service';
import { getAccountInformation } from '@ayahay/services/account.service';

const AuthContext = createContext({
  currentUser: null as User | undefined | null,
  // loggedInAccount is null if it's loading
  loggedInAccount: null as IAccount | undefined | null,
  loading: true,
  register: (email: string, password: string, values: RegisterForm) => Promise,
  signIn: (email: string, password: string) => Promise,
  signInWithGoogle: () => Promise,
  logout: () => Promise,
  resetPassword: (email: string) => Promise,
  emailVerification: (user: User) => Promise<void>,
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
        await currentUser.getIdToken(true);
    }
    const myAccountInformation = await getAccountInformation(currentUser);
    setLoggedInAccount(myAccountInformation);
  };

  function register(email: string, password: string, values: RegisterForm) {
    return createUserWithEmailAndPassword(firebase, email, password)
      .then(async (userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log(`success register`);

        const token = await user.getIdToken();
        const data = await verifyToken(token);
        const { uid } = data;

        const mappedPassenger = mapPassengerToDto(uid, values);
        await createPassenger(token, mappedPassenger);

        await emailVerification(user);

        return token;
      })
      .catch((error) => {
        const errorCode = error.code;
        throw new Error(errorCode);
      });
  }

  function signIn(email: string, password: string): Promise<string> {
    return signInWithEmailAndPassword(firebase, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log(`success sign in`);
        return user.uid;
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        throw new Error(`sign in error`);
      });
  }

  function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }

  function resetPassword(email: string) {
    return sendPasswordResetEmail(firebase, email, {
      url: process.env.NEXT_PUBLIC_WEB_URL ?? 'https://www.ayahay.com',
    })
      .then((res) => {
        // Reset successful.
        console.log(`reset success`);
        return true;
      })
      .catch((error) => {
        throw new Error(`reset error`);
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

  async function emailVerification(user: User) {
    await sendEmailVerification(user);
  }

  const value = {
    currentUser,
    loggedInAccount,
    loading,
    register,
    signIn,
    logout,
    signInWithGoogle,
    resetPassword,
    emailVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
