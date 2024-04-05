import { Middleware, HttpError, handleHttpError, Op } from '@chinaza/honey';
import { verifyApiToken, verifyIdToken, User, getUser } from '@chinaza/auth';
import createProfileModel from '../models/profile';
import { errorMessages } from '../utils/errors';
import { UserPaymentType } from '../utils/constants';
import { getEnv } from '../config';
import { logError } from '../utils/helpers';
import getMailer, { MailTags, MailTemplates } from '../services/mailer';
import redis, { RedisLock } from '../services/redis';

const mailer = getMailer();

type LoginType = 'google' | 'apple' | 'password' | 'guest' | 'mobile';
export interface ReqUser {
  firebaseId: string;
  isEmailVerified: boolean;
  loginType: LoginType;
  profileId?: string;
  email?: string;
  paymentType?: UserPaymentType;
  mindTokens?: number;
  hasOnboarded?: boolean;
}

const isGenerateRequest = (req: any) =>
  req.url.includes('/executions') && req.method === 'POST';

export async function upsertProfile(
  user: User,
  loginType: LoginType,
  req: any
) {
  const profileModel = createProfileModel();

  const userData = await getUser(user.uid).catch(logError);

  const profileData = {
    firebaseId: user.uid,
    email: user.email,
    name: userData?.displayName || user.email
  };

  let profile = await profileModel.findOne({
    where: { [Op.or]: [{ firebaseId: user.uid }, { email: user.email }] }
  });

  if (!profile) {
    const redisLock = new RedisLock(redis.client);
    const profileUnlock = await redisLock.lock(`profile:upsert:${user.uid}`);
    [profile] = await profileModel.upsert(profileData);
    await profileUnlock();
  }

  // This account has not been onboarded, send onboarding email
  // Do it only on generation request
  if (
    profile &&
    !profile.dataValues.hasOnboarded &&
    user.email &&
    (user.email_verified || loginType !== 'password') &&
    isGenerateRequest(req)
  ) {
    profile.update({ hasOnboarded: true }).catch(logError);
    mailer
      .sendTransactionalEmail({
        to: [user.email],
        templateId: MailTemplates.ONBOARDING,
        tags: [MailTags.ONBOARDING]
      })
      .catch(logError);
  }

  return profile?.dataValues;
}

export const validateUserAuth: Middleware = async (req, res, next) => {
  try {
    const token = req.headers['authorization']?.replace('Bearer ', '');

    if (!token) throw new HttpError('Unauthorised request', 401);

    const user = await verifyIdToken(token);
    const signinProvider = user.firebase.sign_in_provider;
    const reqUser: ReqUser = {
      firebaseId: user.uid,
      email: user.email,
      isEmailVerified:
        signinProvider === 'password' ? Boolean(user.email_verified) : true,
      loginType:
        signinProvider === 'password'
          ? 'password'
          : signinProvider === 'google.com'
            ? 'google'
            : signinProvider === 'apple.com'
              ? 'apple'
              : signinProvider === 'custom' && !!user.email
                ? 'mobile'
                : 'guest'
    };

    if (reqUser.loginType !== 'guest') {
      const result = await upsertProfile(user, reqUser.loginType, req).catch(
        (e) => logError(e, user.uid)
      );

      if (result?.id) {
        reqUser.profileId = result?.id;
        reqUser.paymentType = result?.paymentType;
        reqUser.mindTokens = result?.mindTokens;
        reqUser.hasOnboarded = result?.hasOnboarded;
      }
    }

    req.headers['x-user'] = JSON.stringify(reqUser);
    req.body.firebaseId = reqUser.firebaseId;
    req.query.firebaseId = reqUser.firebaseId;

    next();
  } catch (error: any) {
    if (!(error instanceof HttpError))
      error = new HttpError(errorMessages.LOGIN_EXPIRED, 401);
    handleHttpError(error, res);
  }
};

export const isZhap: Middleware = (req, res, next) => {
  try {
    const token = req.headers['authorization']?.replace('Bearer ', '');

    if (!token) throw new HttpError('Unauthorised request', 401);

    const secret = getEnv('API_SECRET');
    if (!verifyApiToken(token, secret))
      throw new HttpError('Unauthorised request', 401);

    next();
  } catch (error) {
    handleHttpError(error as HttpError, res);
  }
};
