import { createClient, RedisClientType } from 'redis';
import { getEnv } from '../config';

class Redis {
  public client;

  constructor() {
    const url = getEnv('REDIS_URL');
    this.client = createClient({
      url
    });
    this.connect();
  }

  private async connect() {
    try {
      this.client.on('error', (err) => console.log('Redis Client Error', err));

      await this.client.connect();
      console.log('Redis connection successful');
    } catch (error) {}
  }
}

const redis = new Redis();
export default redis;

const DEFAULT_TIMEOUT = 5000;
const DEFAULT_RETRY_DELAY = 50;

export class RedisLock {
  constructor(
    private client: typeof redis.client,
    private retryDelay = DEFAULT_RETRY_DELAY
  ) {
    if (!client || typeof client.set !== 'function') {
      throw new Error('A valid Redis client instance is required.');
    }
    this.client = client;
    this.retryDelay = retryDelay;
  }

  private async acquireLock(
    lockName: string,
    timeout: number
  ): Promise<number> {
    const lockTimeoutValue = Date.now() + timeout + 1;
    const result = await this.client.set(lockName, lockTimeoutValue, {
      PX: timeout,
      NX: true
    });
    if (result === null) {
      throw new Error('Lock acquisition failed.');
    }
    return lockTimeoutValue;
  }

  public async lock(
    lockName: string,
    timeout = DEFAULT_TIMEOUT
  ): Promise<() => Promise<boolean>> {
    if (!lockName) {
      throw new Error('A lock name must be specified.');
    }

    lockName = `lock.${lockName}`;
    let lockTimeoutValue: number;

    try {
      lockTimeoutValue = await this.acquireLock(lockName, timeout);
    } catch (err) {
      await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
      return this.lock(lockName, timeout);
    }

    return async () => {
      if (lockTimeoutValue > Date.now()) {
        await this.client.del(lockName);
        return true;
      } else {
        // The lock has expired, return false to indicate the lock was not released by this call
        return false;
      }
    };
  }
}
