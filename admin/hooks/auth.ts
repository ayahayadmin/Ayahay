import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { firebase } from '@/app/utils/initFirebase';

interface IAuth {
  isSignedIn: boolean;
  pending: boolean;
  user: User | null;
}

export function useAuthState() {
  const [authState, setAuthState] = useState<IAuth>({
    isSignedIn: false,
    pending: true,
    user: null,
  });

  useEffect(() => {
    const unregisterAuthObserver = firebase.onAuthStateChanged((user) =>
      setAuthState({ user, pending: false, isSignedIn: !!user })
    );
    return () => unregisterAuthObserver();
  }, []);

  return { firebase, ...authState };
}
