import { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../../src/pages/api/pvgis/calculate';

// Mock the console to suppress logs during testing
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

// Mock for rate limiting
const mockRateLimitMap = new Map();

// Mock for cache
const mockCacheMap = new Map();

// Helper function to create mock request and response
const createMocks = () => {
  const req = {
    method: 'POST',
    headers: {},
    body: {},
    query: {},
    connection: {
      remoteAddress: '127.0.0.1'
    }
  } as unknown as NextApiRequest;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    setHeader: jest.fn(),
    end: jest.fn()
  } as unknown as NextApiResponse;

  return { req, res };
};

describe('PVGIS Calculate API - Unit Tests', () => {
  beforeEach(() => {
    // Reset rate limit and cache maps
    (handler as any).rateLimitMap = new Map();
    (handler as any).cacheMap = new Map();
    jest.clearAllMocks();
  });

  it('should return 405 for non-POST requests', async () => {
    const { req, res } = createMocks();
    req.method = 'GET';

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
  });

  it('should return 400 for missing required parameters', async () => {
    const { req, res } = createMocks();
    req.method = 'POST';
    req.body = { lat: -23.5505 }; // Missing lon and peakpower

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing required parameters: lat, lon, peakpower' });
  });

  it('should return 400 for invalid coordinates', async () => {
    const { req, res } = createMocks();
    req.method = 'POST';
    req.body = {
      lat: 100, // Invalid latitude
      lon: -46.6333,
      peakpower: 5
    };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid lat/lon coordinates' });
  });

  it('should return 400 for invalid longitude', async () => {
    const { req, res } = createMocks();
    req.method = 'POST';
    req.body = {
      lat: -23.5505,
      lon: 200, // Invalid longitude
      peakpower: 5
    };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid lat/lon coordinates' });
  });

  it('should return 400 for negative peakpower', async () => {
    const { req, res } = createMocks();
    req.method = 'POST';
    req.body = {
      lat: -23.5505,
      lon: -46.6333,
      peakpower: -1 // Invalid peakpower
    };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Peak power must be greater than 0' });
  });

  it('should return 429 when rate limit is exceeded', async () => {
    const { req, res } = createMocks();
    req.method = 'POST';
    req.body = {
      lat: -23.5505,
      lon: -46.6333,
      peakpower: 5
    };
    req.headers['x-forwarded-for'] = '127.0.0.1';

    // Simulate rate limit being exceeded
    const handlerWithLimited = require('../../../src/pages/api/pvgis/calculate');
    handlerWithLimited.RATE_LIMIT = 1; // Set rate limit to 1 for testing
    handlerWithLimited.rateLimitMap.set('127.0.0.1', { count: 100, resetTime: Date.now() + 3600000 }); // 1 hour in future

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({ error: 'Rate limit exceeded' });
  });

  it('should return valid response for valid request', async () => {
    const { req, res } = createMocks();
    req.method = 'POST';
    req.body = {
      lat: -23.5505,
      lon: -46.6333,
      peakpower: 5
    };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        E_d: expect.any(Number),
        E_m: expect.any(Number),
        E_y: expect.any(Number),
        H_sun: expect.any(Number),
        location: {
          lat: -23.5505,
          lon: -46.6333,
          elevation: expect.any(Number)
        },
        system: {
          peakpower: 5,
          loss: 14,
          angle: 30,
          aspect: 0
        },
        source: "PVGIS Simulation"
      })
    );
  });

  it('should handle OPTIONS request correctly', async () => {
    const { req, res } = createMocks();
    req.method = 'OPTIONS';

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.end).toHaveBeenCalled();
  });

  it('should return 500 for internal errors', async () => {
    // Mock the internal functions to throw an error
    jest.spyOn(global.Date, 'now').mockImplementation(() => {
      throw new Error('Test error');
    });

    const { req, res } = createMocks();
    req.method = 'POST';
    req.body = {
      lat: -23.5505,
      lon: -46.6333,
      peakpower: 5
    };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to calculate solar production' });

    // Restore the original implementation
    jest.spyOn(global.Date, 'now').mockRestore();
  });
});