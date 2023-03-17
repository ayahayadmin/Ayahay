import { BasicProfile } from '../models/profile.model';

const profilesMock = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'johndoe@email.com',
    password: 'johndoe123',
  },
];

export function saveProfile(values: BasicProfile) {
  const { firstName, lastName, email, password } = values;
  profilesMock.push({
    firstName,
    lastName,
    email,
    password,
  });

  console.log(profilesMock);

  return {
    firstName,
    lastName,
    email,
    password,
  };
}
