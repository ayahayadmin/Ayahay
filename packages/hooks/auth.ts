import { auth } from '@ayahay/admin/app/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { IAccount } from '@ayahay/models';
import { useRouter } from 'next/navigation';
import { getMyAccountInformation } from '@ayahay/services/account.service';

export function useLoggedInAccount() {
  const [loggedInAccount, setLoggedInAccount] = useState<
    IAccount | undefined
  >();
  const router = useRouter();

  useEffect(() => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        await fetchLoggedInAccount();
      } else {
        // User is signed out
        setLoggedInAccount(undefined);
        if (window.location.origin === process.env.NEXT_PUBLIC_ADMIN_URL) {
          router.push('/');
        }
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
