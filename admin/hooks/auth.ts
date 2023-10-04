import { auth } from '@/app/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';

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
    const unregisterAuthObserver = auth.onAuthStateChanged((user) =>
      setAuthState({ user, pending: false, isSignedIn: !!user })
    );
    return () => unregisterAuthObserver();
  }, []);

  return { auth, ...authState };
}
