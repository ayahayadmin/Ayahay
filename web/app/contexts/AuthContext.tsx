import {
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  getAuth,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { createContext, useContext } from 'react';
import { initFirebase } from '../utils/initFirebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { verifyToken } from '@/services/auth.service';
import { invalidateItem } from '@ayahay/services/cache.service';
import { accountRelatedCacheKeys } from '@ayahay/constants';
import { IAccount, RegisterForm } from '@ayahay/models';
import {
  createPassenger,
  mapPassengerToDto,
} from '@/services/passenger.service';

initFirebase();
export const auth = getAuth();
const AuthContext = createContext({
  currentUser: null,
  loggedInAccount: undefined as IAccount | undefined,
  register: (email: string, password: string, values: RegisterForm) => Promise,
  signIn: (email: string, password: string) => Promise,
  signInWithGoogle: () => Promise,
  logout: () => Promise,
  resetPassword: (email: string) => Promise,
  emailVerification: (user: User) => Promise<void>,
});

export const useAuth = () => useContext(AuthContext);

export default function AuthContextProvider({ children }: any) {
  const [currentUser, loading] = useAuthState(auth);

  function register(email: string, password: string, values: RegisterForm) {
    return createUserWithEmailAndPassword(auth, email, password)
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

        return uid;
      })
      .catch((error) => {
        const errorCode = error.code;
        throw new Error(errorCode);
      });
  }

  function signIn(email: string, password: string): Promise<string> {
    return signInWithEmailAndPassword(auth, email, password)
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
    return sendPasswordResetEmail(auth, email, {
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

  async function emailVerification(user: User) {
    await sendEmailVerification(user);
  }

  const value = {
    currentUser,
    register,
    signIn,
    logout,
    signInWithGoogle,
    resetPassword,
    emailVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
