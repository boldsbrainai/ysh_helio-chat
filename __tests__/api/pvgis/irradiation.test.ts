import { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../../src/pages/api/pvgis/irradiation';

// Mock the console to suppress logs during testing
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

// Mock for cache
const mockCacheMap = new Map();

// Helper function to create mock request and response
const createMocks = () => {
  const req = {
    method: 'GET',
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

describe('PVGIS Irradiation API - Unit Tests', () => {
  beforeEach(() => {
    // Reset cache map
    (handler as any).cacheMap = new Map();
    jest.clearAllMocks();
  });

  it('should return 405 for non-GET requests', async () => {
    const { req, res } = createMocks();
    req.method = 'POST';

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
  });

  it('should return 400 for missing required parameters', async () => {
    const { req, res } = createMocks();
    req.method = 'GET';
    req.query = {}; // Missing lat and lon

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing required parameters: lat, lon' });
  });

  it('should return 400 for invalid coordinates', async () => {
    const { req, res } = createMocks();
    req.method = 'GET';
    req.query = {
      lat: '100', // Invalid latitude
      lon: '-46.6333'
    };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid lat/lon coordinates' });
  });

  it('should return 400 for invalid longitude', async () => {
    const { req, res } = createMocks();
    req.method = 'GET';
    req.query = {
      lat: '-23.5505',
      lon: '200' // Invalid longitude
    };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid lat/lon coordinates' });
  });

  it('should return valid response for valid request', async () => {
    const { req, res } = createMocks();
    req.method = 'GET';
    req.query = {
      lat: '-23.5505',
      lon: '-46.6333'
    };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        lat: -23.5505,
        lon: -46.6333,
        irradiation: expect.objectContaining({
          daily: expect.any(Number),
          monthly: expect.any(Number),
          annual: expect.any(Number),
          sun_hours: expect.any(Number)
        }),
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
    const originalParse = parseFloat;
    jest.spyOn(global, 'parseFloat').mockImplementation(() => {
      throw new Error('Test error');
    });

    const { req, res } = createMocks();
    req.method = 'GET';
    req.query = {
      lat: 'invalid', // This will cause parseFloat to fail in the mock
      lon: '-46.6333'
    };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to get irradiation data' });

    // Restore original implementation
    jest.spyOn(global, 'parseFloat').mockRestore();
  });

  it('should return valid response for string coordinates', async () => {
    const { req, res } = createMocks();
    req.method = 'GET';
    req.query = {
      lat: '-23.5505',
      lon: '-46.6333'
    };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        lat: expect.any(Number),
        lon: expect.any(Number)
      })
    );
  });
});