import { initialize } from 'unleash-client';

import { getEnv } from '../config';
import createSingleton from '../utils/singleton';

export function getFlagsClient() {
  const url = getEnv('UNLEASH_URL');
  const key = getEnv('UNLEASH_KEY');

  const unleash = createSingleton('unleash', () => {
    return initialize({
      url,
      appName: 'promind-api',
      customHeaders: {
        Authorization: key
      }
    });
  });

  return unleash;
}
