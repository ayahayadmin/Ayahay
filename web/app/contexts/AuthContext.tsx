import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { createContext, useContext, useState } from 'react';
import { initFirebase } from '../utils/initFirebase';
import { useAuthState } from 'react-firebase-hooks/auth';

initFirebase();
const auth = getAuth();
const AuthContext = createContext({
  currentUser: null,
  register: (email: string, password: string) => Promise,
  signIn: (email: string, password: string) => Promise,
  signInWithGoogle: () => Promise,
  logout: () => Promise,
});

export const useAuth = () => useContext(AuthContext);

export default function AuthContextProvider({ children }: any) {
  const [currentUser, loading] = useAuthState(auth);
  // const [currentUser, setCurrentUser] = useState(null);

  function register(email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log(`success register: ${JSON.stringify(user, null, 2)}`);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(`register in error: ${errorCode}: ${errorMessage}`);
      });
  }

  function signIn(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log(`success sign in: ${JSON.stringify(user, null, 2)}`);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(`sign in error: ${errorCode}: ${errorMessage}`);
      });
  }

  function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }

  function logout() {
    return signOut(auth)
      .then(() => {
        // Sign-out successful.
        console.log('sign out success');
      })
      .catch((error) => {
        // An error happened.
        console.log('sign out error');
      });
  }

  const value = {
    currentUser,
    register,
    signIn,
    logout,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
