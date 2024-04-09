import * as Sentry from '@sentry/node';
import { HttpError } from '@chinaza/honey';

import { ReqUser } from '../middlewares/auth';
import { IS_PROD } from '../config';
import createProfileModel from '../models/profile';
import { ClientType } from '../middlewares/headers';

export const toSentenceCase = (text: string) => {
  return text[0].toUpperCase() + text.substring(1);
};

export const getUserFromHeader = (headers: any): ReqUser => {
  try {
    const user = JSON.parse(headers['x-user']);
    return user;
  } catch {
    throw new HttpError('You need to login to proceed', 401);
  }
};

export const getUserFromReq = (req: any) => getUserFromHeader(req.headers);

export const getClientType = (headers: any): ClientType => {
  const clientType = headers['x-client-type'];

  if (!clientType) {
    throw new HttpError('Missing header injection middleware', 500);
  }

  return clientType;
};

export function logError(error: Error, userId?: string) {
  console.error(error);

  if (IS_PROD) {
    Sentry.setUser({ id: userId });
    Sentry.captureException(error);
  }
}

interface ProfileParams {
  firebaseId: string;
}
export const getProfileId = async ({ firebaseId }: ProfileParams) => {
  const profileModel = createProfileModel();
  const result: any = await profileModel.findOne({
    where: {
      firebaseId
    }
  });

  if (!result) throw new Error('Profile not found');

  return result.id;
};
