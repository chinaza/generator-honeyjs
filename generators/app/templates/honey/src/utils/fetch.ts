import fetch from 'node-fetch';
import stringify from 'qs-stringify';

type FetchMethod = 'POST' | 'GET' | 'PUT' | 'DELETE';

export class HttpError extends Error {
  constructor(message: string, public code?: number) {
    super(message || 'Something went wrong');
  }
}

export class Http {
  constructor(
    private baseUrl: string,
    private headers: Record<string, string> = {}
  ) {}

  async makeRequest<T = any>(
    url: string,
    method: FetchMethod = 'GET',
    data: Record<string, any> = {}
  ): Promise<T> {
    try {
      let reqUrl = `${this.baseUrl}${url}`;

      const body = data && method !== 'GET' ? JSON.stringify(data) : undefined;

      if (method === 'GET' && data && Object.keys(data).length) {
        const q = stringify(data);
        reqUrl += `?${q}`;
      }

      const res = await fetch(reqUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...this.headers
        },
        body
      });

      const resData: any = await res.json();

      if (!res.ok) {
        const error = new HttpError(resData.message, res.status);
        throw error;
      }

      return resData;
    } catch (error: any) {
      throw new HttpError(error.message || 'Network error!', error.code);
    }
  }
}
