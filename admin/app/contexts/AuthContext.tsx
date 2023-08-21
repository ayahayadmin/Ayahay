import {
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { createContext, useContext } from 'react';
import { initFirebase } from '../utils/initFirebase';
import { useAuthState } from 'react-firebase-hooks/auth';

initFirebase();
const auth = getAuth();
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
        console.log(`success sign in: ${JSON.stringify(user, null, 2)}`);
        return user.uid;
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        throw new Error(`sign in error: ${errorCode}: ${errorMessage}`);
      });
  }

  function resetPassword(email: string) {
    return sendPasswordResetEmail(auth, email, { url: 'http://localhost:3002' }) //TO DO: localhost would be changed ofc
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
    signIn,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
