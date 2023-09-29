import { auth, useAuth } from '@/app/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { IAccount } from '@ayahay/models';
import { getMyAccountInformation } from '@/services/account.service';

export function useLoggedInAccount() {
  const [loggedInAccount, setLoggedInAccount] = useState<
    IAccount | undefined
  >();

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        fetchLoggedInAccount();
      } else {
        // User is signed out
        setLoggedInAccount(undefined);
      }
    });
  }, []);

  const fetchLoggedInAccount = async () => {
    const myAccountInformation = await getMyAccountInformation();
    if (myAccountInformation === undefined) {
      return;
    }

    setLoggedInAccount(myAccountInformation);
  };

  return { loggedInAccount };
}
