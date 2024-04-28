import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { firebase } from '@/utils/initFirebase';
import { redirect } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

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

export function useAuthGuard(roles?: string[]) {
  const { loggedInAccount } = useAuth();

  useEffect(() => {
    if (loggedInAccount === null) {
      return;
    }

    if (loggedInAccount === undefined || loggedInAccount.role === 'Passenger') {
      redirect('/');
    } else if (roles && !roles.includes(loggedInAccount.role)) {
      redirect('/403');
    }
  }, [loggedInAccount]);
}
