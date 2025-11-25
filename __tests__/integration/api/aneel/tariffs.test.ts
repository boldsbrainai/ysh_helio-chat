/**
 * ANEEL Tariffs API Integration Tests
 */

import handler from '../../../src/pages/api/aneel/tariffs';

// Mock Next.js API objects for testing
class MockNextApiRequest {
  method: string;
  headers: any;
  body: any;
  query: any;
  connection: { remoteAddress: string };

  constructor(options: { method?: string; headers?: any; body?: any; query?: any } = {}) {
    this.method = options.method || 'GET';
    this.headers = options.headers || {};
    this.body = options.body || {};
    this.query = options.query || {};
    this.connection = { remoteAddress: '127.0.0.1' };
  }
}

class MockNextApiResponse {
  private _statusCode: number = 200;
  private _headers: { [key: string]: string } = {};
  private _data: any = null;

  status(code: number) {
    this._statusCode = code;
    return this;
  }

  setHeader(name: string, value: string) {
    this._headers[name] = value;
    return this;
  }

  json(data: any) {
    this._data = data;
    return this;
  }

  end() {
    return this;
  }

  getStatusCode() {
    return this._statusCode;
  }

  getJsonData() {
    return this._data;
  }

  getHeaders() {
    return this._headers;
  }
}

// Mock console to suppress logging during tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

describe('ANEEL Tariffs API Integration', () => {
  beforeEach(() => {
    // Clear rate limit and cache maps if they exist
    if ((handler as any).rateLimitMap) {
      (handler as any).rateLimitMap.clear();
    }
    if ((handler as any).cacheMap) {
      (handler as any).cacheMap.clear();
    }
  });

  it('should handle valid tariffs request without filters', async () => {
    const req = new MockNextApiRequest({
      method: 'GET',
      query: {}
    });

    const res = new MockNextApiResponse();

    await (handler as any)(req, res);

    expect(res.getStatusCode()).toBe(200);
    
    const data = res.getJsonData();
    expect(data).toHaveProperty('tariffs');
    expect(Array.isArray(data.tariffs)).toBe(true);
    expect(data).toHaveProperty('total');
    expect(typeof data.total).toBe('number');
    expect(data).toHaveProperty('filters');
    expect(data.filters).toHaveProperty('distribuidora', null);
    expect(data.filters).toHaveProperty('estado', null);
  });

  it('should handle request with distribuidora filter', async () => {
    const req = new MockNextApiRequest({
      method: 'GET',
      query: {
        distribuidora: 'CPFL'
      }
    });

    const res = new MockNextApiResponse();

    await (handler as any)(req, res);

    expect(res.getStatusCode()).toBe(200);
    
    const data = res.getJsonData();
    expect(data).toHaveProperty('tariffs');
    expect(data).toHaveProperty('filters');
    expect(data.filters).toHaveProperty('distribuidora', 'CPFL');
  });

  it('should handle request with estado filter', async () => {
    const req = new MockNextApiRequest({
      method: 'GET',
      query: {
        estado: 'SP'
      }
    });

    const res = new MockNextApiResponse();

    await (handler as any)(req, res);

    expect(res.getStatusCode()).toBe(200);
    
    const data = res.getJsonData();
    expect(data).toHaveProperty('tariffs');
    expect(data).toHaveProperty('filters');
    expect(data.filters).toHaveProperty('estado', 'SP');
  });

  it('should handle request with limit parameter', async () => {
    const req = new MockNextApiRequest({
      method: 'GET',
      query: {
        limit: '10'
      }
    });

    const res = new MockNextApiResponse();

    await (handler as any)(req, res);

    expect(res.getStatusCode()).toBe(200);
    
    const data = res.getJsonData();
    expect(data).toHaveProperty('tariffs');
    expect(Array.isArray(data.tariffs)).toBe(true);
    // The array should have at most 10 elements
    expect(data.tariffs.length).toBeLessThanOrEqual(10);
  });

  it('should handle method not allowed', async () => {
    const req = new MockNextApiRequest({
      method: 'POST',
      body: {
        distribuidora: 'CPFL'
      }
    });

    const res = new MockNextApiResponse();

    await (handler as any)(req, res);

    expect(res.getStatusCode()).toBe(405);
    const data = res.getJsonData();
    expect(data).toEqual({ error: 'Method not allowed' });
  });

  it('should handle CORS for OPTIONS request', async () => {
    const req = new MockNextApiRequest({
      method: 'OPTIONS',
    });

    const res = new MockNextApiResponse();

    await (handler as any)(req, res);

    expect(res.getStatusCode()).toBe(200);
  });
});