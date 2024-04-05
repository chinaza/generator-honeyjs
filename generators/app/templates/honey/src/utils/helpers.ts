import * as Sentry from '@sentry/node';
import { HttpError } from '@chinaza/honey';

import { ReqUser } from '../middlewares/auth';
import { IS_PROD } from '../config';
import createProfileModel from '../models/profile';
import { ClientType } from '../middlewares/headers';
import createPreferencesModel from '../models/preferences';

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

export const getUserSettings = async (profileId: string) => {
  const preferencesModel = createPreferencesModel();
  const result: any = await preferencesModel.findAll({
    where: {
      profileId
    }
  });

  if (!result?.length) return {};

  return result.reduce(
    (prev: Record<string, string>, cur: Record<string, string>) => {
      prev[cur.key] = cur.value;
      return prev;
    },
    {} as Record<string, string>
  );
};

export const getOutputLanguage = async (profileId?: string) => {
  try {
    if (!profileId) return 'English';

    const { language } = await getUserSettings(profileId);
    return language as string;
  } catch (error) {
    return 'English';
  }
};
