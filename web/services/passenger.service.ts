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
