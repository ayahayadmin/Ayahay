import { Injectable } from '@nestjs/common';
import { ITravelAgency } from '@ayahay/models';

@Injectable()
export class TravelAgencyMapper {
  constructor() {}

  convertTravelAgencyToDto(travelAgency: any): ITravelAgency {
    return null;
  }

  convertTravelAgencyToEntity(travelAgency: ITravelAgency): any {
    return null;
  }
}
