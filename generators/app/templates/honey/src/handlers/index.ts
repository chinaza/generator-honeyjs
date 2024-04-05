import { Honey } from '@chinaza/honey';

import ProfileHandler from './profile';
import AuthHandler from './auth';

export default function initHandlers(honey: Honey) {
  new ProfileHandler(honey);
  new AuthHandler(honey);
  honey.routes.get('/', (_, res) => {
    res.send({ message: `Honey API ©${new Date().getFullYear()}` });
  });
}
