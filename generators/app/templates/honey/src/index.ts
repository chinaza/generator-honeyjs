import { createHoney } from '@chinaza/honey';

import { getEnv, initSentry } from './config';
import initHandlers from './handlers';
import initModels from './models';

const DATABASE_URL = getEnv('DATABASE_URL');
const PORT = getEnv('PORT');

const honey = createHoney(PORT, DATABASE_URL);

initModels();
initSentry(honey);
initHandlers(honey);

honey.startServer();
