import { PASSENGER_API } from '@ayahay/constants';
import { IPassenger, RegisterForm } from '@ayahay/models';
import axios from '@ayahay/services/axios';

export function mapPassengerToDto(
  uid: string,
  values: RegisterForm
): IPassenger {
  const {
    firstName,
    lastName,
    occupation,
    sex,
    civilStatus,
    birthday,
    address,
    nationality,
  } = values;

  return {
    id: -1,
    accountId: uid,
    firstName,
    lastName,
    occupation,
    sex,
    civilStatus,
    birthdayIso: new Date(birthday).toISOString(),
    address,
    nationality,
  };
}

export async function createPassenger(token: string, passenger: IPassenger) {
  try {
    const { data } = await axios.post(`${PASSENGER_API}`, passenger, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}
