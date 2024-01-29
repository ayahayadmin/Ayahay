import { BOOKING_API, SHIPS_API } from '@ayahay/constants';
import axios from '@ayahay/services/axios';
import { IBooking, IDryDock, IShip, IVoyage } from '@ayahay/models';
import { PaginatedRequest, PaginatedResponse } from '@ayahay/http';

export async function getShipsOfMyShippingLine(): Promise<IShip[]> {
  try {
    const { data } = await axios.get(`${SHIPS_API}/my-shipping-line`);
    return data;
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getVoyagesAfterLastMaintenance(
  shipId: number,
  pagination: PaginatedRequest
): Promise<PaginatedResponse<IVoyage> | undefined> {
  return getVoyagesOfShip(shipId, true, pagination);
}

async function getVoyagesOfShip(
  shipId: number,
  afterLastMaintenance: boolean,
  pagination: PaginatedRequest
): Promise<PaginatedResponse<IVoyage> | undefined> {
  const query = new URLSearchParams({
    afterLastMaintenance,
    ...pagination,
  } as any).toString();

  try {
    const { data: voyages } = await axios.get<PaginatedResponse<IVoyage>>(
      `${SHIPS_API}/${shipId}/voyages?${query}`
    );

    return voyages;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export async function getVoyagesBeforeLastMaintenance(
  shipId: number,
  pagination: PaginatedRequest
): Promise<PaginatedResponse<IVoyage> | undefined> {
  return getVoyagesOfShip(shipId, false, pagination);
}

export async function getDryDocks(
  shipId: number,
  pagination: PaginatedRequest
): Promise<PaginatedResponse<IDryDock> | undefined> {
  const query = new URLSearchParams(pagination as any).toString();

  try {
    const { data: dryDocks } = await axios.get<PaginatedResponse<IDryDock>>(
      `${SHIPS_API}/${shipId}/dry-docks?${query}`
    );

    return dryDocks;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export async function createVoyage(
  shipId: number,
  remarks: string
): Promise<void> {
  try {
    await axios.post(`${SHIPS_API}/${shipId}/voyages`, {
      remarks,
    });
  } catch (e) {
    console.error(e);
  }
}

export async function createDryDock(shipId: number): Promise<void> {
  try {
    await axios.post(`${SHIPS_API}/${shipId}/dry-docks`);
  } catch (e) {
    console.error(e);
  }
}
