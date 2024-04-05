import { Honey, Middleware, handleHttpError } from '@chinaza/honey';
import { validateUserAuth } from '../middlewares/auth';
import createProfileModel from '../models/profile';
import { deleteUser } from '@chinaza/auth';

export default class ProfileHandler {
  constructor(honey: Honey) {
    honey.create({
      resource: 'profile',
      params: {
        firebaseId: 'string',
        name: 'string',
        email: 'string'
      },
      middleware: [validateUserAuth],
      message: 'Profile updated successfully'
    });

    honey.getById({
      resource: 'profile',
      idField: 'firebaseId',
      pathOverride: '/profile',
      fields: ['name', 'email', 'mindTokens', 'paymentType'],
      middleware: [
        validateUserAuth,
        (req, _, next) => {
          req.params.id = req.body.firebaseId;
          next();
        }
      ]
    });

    honey.deleteById({
      resource: 'profile',
      pathOverride: '/profile',
      message: 'Account deleted successfully',
      middleware: [validateUserAuth, this.deleteFirebaseAccount]
    });
  }

  private deleteFirebaseAccount: Middleware = async (req, res, next) => {
    try {
      const profileModel = createProfileModel();
      const profile: any = await profileModel.findOne({
        where: {
          firebaseId: req.body.firebaseId
        }
      });

      await deleteUser(req.body.firebaseId);

      if (!profile) {
        return res.send({ message: 'Account deleted successfully' });
      }

      req.params.id = profile.id;
      next();
    } catch (error: any) {
      handleHttpError(error, res);
    }
  };
}
