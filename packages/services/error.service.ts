import axios, { AxiosError } from 'axios';
import { ApiError } from '@ayahay/http';

export function getAxiosError(error: any): ApiError | undefined {
  if (!axios.isAxiosError(error)) {
    return undefined;
  }

  const errorResponse = (error as AxiosError<ApiError>).response;

  if (errorResponse === undefined) {
    return undefined;
  }

  return errorResponse.data;
}
