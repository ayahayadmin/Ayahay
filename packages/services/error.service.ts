import axios, { AxiosError } from 'axios';
import { NestJsDefaultError } from '@ayahay/http';

export function getAxiosError(error: any): NestJsDefaultError | undefined {
  if (!axios.isAxiosError(error)) {
    return undefined;
  }

  const errorResponse = (error as AxiosError<NestJsDefaultError>).response;

  if (errorResponse === undefined) {
    return undefined;
  }

  return errorResponse.data;
}
