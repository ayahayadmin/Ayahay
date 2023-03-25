import { CIVIL_STATUS, SEX } from '@/common/constants/enum';
import { Profile } from '@/common/models/profile.model';
import PassengerPreferences from '@/common/models/passenger-preferences';

export default interface Passenger {
  id?: number;
  profile?: Profile;
  firstName: string;
  lastName: string;
  sex: SEX;
  civilStatus: CIVIL_STATUS;
  birthdayIso: string;
  address: string;
  nationality: string;
  passengerPreferences?: PassengerPreferences;
}
