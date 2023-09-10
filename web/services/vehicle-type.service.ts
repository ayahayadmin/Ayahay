import { VEHICLE_TYPES_API } from '@ayahay/constants';
import { IVehicleType } from '@ayahay/models';
import axios from 'axios';
import dayjs from 'dayjs';
import { isWithinTimeInterval } from './utils';

async function fetchAndCacheVehicleTypes(): Promise<IVehicleType[]> {
  const { data } = await axios.get(`${VEHICLE_TYPES_API}`);
  localStorage.setItem(
    'vehicle-types',
    JSON.stringify({ data, timestamp: dayjs() })
  );
  return data;
}

export async function getVehicleTypes(): Promise<IVehicleType[]> {
  const vehicleTypesJson = localStorage.getItem('vehicle-types');
  if (vehicleTypesJson === undefined || vehicleTypesJson === null) {
    return await fetchAndCacheVehicleTypes();
  }

  const { data, timestamp } = JSON.parse(vehicleTypesJson);
  if (!isWithinTimeInterval(timestamp)) {
    return await fetchAndCacheVehicleTypes();
  }
  return data;
}

export async function getVehicleType(
  vehicleTypeId: number
): Promise<IVehicleType | undefined> {
  const vehicleTypes = await getVehicleTypes();
  return vehicleTypes.find((vehicleType) => vehicleType.id === vehicleTypeId);
}
