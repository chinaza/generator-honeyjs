import * as Sentry from '@sentry/node';
import path from 'path';
import * as dotenv from 'dotenv';
import { Honey } from '@chinaza/honey';
dotenv.config();
dotenv.config({ path: path.join(__dirname, '.env') });

export const getEnv = (key: string) => {
  const value = process.env[key];
  if (!value) throw new Error(`${key} env is missing`);
  return value;
};

export const IS_PROD = ['prod', 'production'].includes(getEnv('ENV'));

export const initSentry = (honey: Honey) => {
  const SENTRY_DSN = getEnv('SENTRY_DSN');
  const SENTRY_SERVER_NAME = getEnv('SENTRY_SERVER_NAME');
  if (IS_PROD) {
    Sentry.init({
      dsn: SENTRY_DSN,
      serverName: SENTRY_SERVER_NAME,
      environment: 'production',
      tracesSampleRate: 0.2,
      integrations: [
        // enable tracing
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({ router: honey.routes }),
        new Sentry.Integrations.Postgres(),
        // Automatically instrument Node.js libraries and frameworks
        ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations()
      ]
    });
  }
};

export const timeOp = (name: string) => {
  const span = IS_PROD ? Sentry.startInactiveSpan({ name }) : undefined;
  return () => {
    span?.finish();
  };
};
