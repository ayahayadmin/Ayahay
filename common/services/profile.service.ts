import { ROLE } from '../constants/enum';
import { BasicProfile } from '../models/profile.model';

const profilesMock = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'johndoe@email.com',
    password: 'johndoe123',
    role: ROLE.Client,
  },
];

export function saveProfile(values: BasicProfile) {
  const { firstName, lastName, email, password } = values;
  const role = ROLE.Client;
  profilesMock.push({
    firstName,
    lastName,
    email,
    password,
    role,
  });

  console.log(profilesMock);

  return {
    firstName,
    lastName,
    email,
    password,
    role,
  };
}
