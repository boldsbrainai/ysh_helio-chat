/**
 * NASA Climate API Integration Tests
 */

import handler from '../../../src/pages/api/nasa/climate';

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

describe('NASA Climate API Integration', () => {
  beforeEach(() => {
    // Clear rate limit and cache maps if they exist
    if ((handler as any).rateLimitMap) {
      (handler as any).rateLimitMap.clear();
    }
    if ((handler as any).cacheMap) {
      (handler as any).cacheMap.clear();
    }
  });

  it('should handle valid climate data request', async () => {
    const req = new MockNextApiRequest({
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: {
        lat: -23.5505,
        lon: -46.6333
      },
    });

    const res = new MockNextApiResponse();

    await (handler as any)(req, res);

    expect(res.getStatusCode()).toBe(200);
    
    const data = res.getJsonData();
    expect(data).toHaveProperty('irradiation_avg');
    expect(data).toHaveProperty('temperature_avg');
    expect(data).toHaveProperty('wind_speed_avg');
    expect(data).toHaveProperty('precipitation_avg');
    expect(data).toHaveProperty('humidity_avg');
    expect(data).toHaveProperty('location');
    expect(data.location).toHaveProperty('lat', -23.5505);
    expect(data.location).toHaveProperty('lon', -46.6333);
    expect(data).toHaveProperty('period');
    expect(data.period).toHaveProperty('start');
    expect(data.period).toHaveProperty('end');
    expect(data).toHaveProperty('source');
  });

  it('should validate required parameters', async () => {
    const req = new MockNextApiRequest({
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: {
        lat: -23.5505
        // Missing lon
      },
    });

    const res = new MockNextApiResponse();

    await (handler as any)(req, res);

    expect(res.getStatusCode()).toBe(400);
    const data = res.getJsonData();
    expect(data).toEqual({ error: 'Missing required parameters: lat, lon' });
  });

  it('should validate coordinate ranges', async () => {
    const req = new MockNextApiRequest({
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: {
        lat: 100, // Invalid latitude
        lon: -46.6333
      },
    });

    const res = new MockNextApiResponse();

    await (handler as any)(req, res);

    expect(res.getStatusCode()).toBe(400);
    const data = res.getJsonData();
    expect(data).toEqual({ error: 'Invalid lat/lon coordinates' });
  });

  it('should handle method not allowed', async () => {
    const req = new MockNextApiRequest({
      method: 'PUT', // Invalid method
      headers: {
        'content-type': 'application/json',
      },
      body: {
        lat: -23.5505,
        lon: -46.6333
      },
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