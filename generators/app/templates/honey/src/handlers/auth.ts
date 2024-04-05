import { Honey, HttpError, handleHttpError } from '@chinaza/honey';
import { createFbCustomToken, verifyIdToken } from '@chinaza/auth';

export default class AuthHandler {
  constructor(honey: Honey) {
    honey.routes.post('/auth/token', async (req, res) => {
      try {
        if (!req.body.token) throw new HttpError('Missing token param', 422);

        const user = await verifyIdToken(req.body.token);
        const token = await createFbCustomToken(user.uid);

        return res.send({ data: { token } });
      } catch (error: any) {
        handleHttpError(error, res);
      }
    });
  }
}
