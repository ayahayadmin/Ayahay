import { find } from 'lodash';
import { ROLE } from '@ayahay/constants/enum';
import { BasicProfile, LoginForm } from '@ayahay/models/profile.model';

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

export function getProfiles() {
  return profilesMock;
}

export function onLogin(credentials: LoginForm) {
  const { email, password } = credentials;
  const profiles = getProfiles();

  const profile = find(profiles, { email, password });

  if (!profile) {
    throw 'Profile Not Found!';
  }
  return profile; //return JWT
}
