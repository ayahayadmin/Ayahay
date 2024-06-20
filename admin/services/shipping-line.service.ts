import {
  IShippingLineSchedule,
  ITravelAgency,
  ITrip,
  IVoyage,
} from '@ayahay/models';
import axios from '@ayahay/services/axios';
import { SHIPPING_LINE_API } from '@ayahay/constants';
import { PaginatedRequest, PaginatedResponse } from '@ayahay/http';

export async function getSchedulesOfShippingLine(
  shippingLineId: number
): Promise<IShippingLineSchedule[] | undefined> {
  try {
    const { data: schedules } = await axios.get<IShippingLineSchedule[]>(
      `${SHIPPING_LINE_API}/${shippingLineId}/schedules`
    );

    return schedules;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export async function getPartnerTravelAgenciesOfShippingLine(
  shippingLineId: number,
  pagination: PaginatedRequest
): Promise<PaginatedResponse<ITravelAgency> | undefined> {
  try {
    const { data: travelAgencies } = await axios.get<
      PaginatedResponse<ITravelAgency>
    >(`${SHIPPING_LINE_API}/${shippingLineId}/travel-agencies`);

    return schedules;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}
