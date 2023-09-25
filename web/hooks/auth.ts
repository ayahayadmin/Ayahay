import { useAuth } from '@/app/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { IAccount } from '@ayahay/models';
import { getMyAccountInformation } from '@/services/account.service';

export function useLoggedInAccount() {
  const { currentUser } = useAuth();
  const [loggedInAccount, setLoggedInAccount] = useState<
    IAccount | undefined
  >();

  useEffect(() => {
    if (currentUser) {
      fetchLoggedInAccount();
    } else {
      setLoggedInAccount(undefined);
    }
  }, [currentUser]);

  const fetchLoggedInAccount = async () => {
    const myAccountInformation = await getMyAccountInformation();
    if (myAccountInformation === undefined) {
      return;
    }

    setLoggedInAccount(myAccountInformation);
  };

  return { loggedInAccount };
}
