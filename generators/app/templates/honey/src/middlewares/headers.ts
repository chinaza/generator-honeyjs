import { Middleware, handleHttpError } from '@chinaza/honey';

export enum ClientTypeEnum {
  mobile = 'MOBILE',
  web = 'WEB'
}
export type ClientType = keyof typeof ClientTypeEnum;

export const injectHeaders: Middleware = async (req, res, next) => {
  try {
    const clientType: ClientType =
      (req.headers['x-client-type'] as ClientType) ||
      (req.headers.origin === 'capacitor://localhost' ? 'mobile' : 'web');

    req.headers['x-client-type'] = clientType;

    next();
  } catch (error: any) {
    handleHttpError(error, res);
  }
};
