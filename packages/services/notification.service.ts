import { NOTIFICATION_API } from '@ayahay/constants';
import axios from './axios';
import { INotification } from '@ayahay/models';
import { PaginatedRequest } from '@ayahay/http';

export async function getMyNotifications(
  pagination: PaginatedRequest
): Promise<INotification[] | undefined> {
  try {
    const query = new URLSearchParams(pagination as any).toString();
    const { data: notifications } = await axios.get<INotification[]>(
      `${NOTIFICATION_API}/mine?${query}`
    );

    return notifications;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export async function createAnnouncement(
  notification: INotification
): Promise<void> {
  return axios.post(`${NOTIFICATION_API}/public`, notification);
}
