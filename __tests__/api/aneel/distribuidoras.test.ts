import { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../../src/pages/api/aneel/distribuidoras';

// Mock the console to suppress logs during testing
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

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

describe('ANEEL Distribuidoras API - Unit Tests', () => {
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

  it('should return valid response for valid request', async () => {
    const { req, res } = createMocks();
    req.method = 'GET';
    req.query = {};

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        distribuidoras: expect.arrayContaining([
          expect.any(String)
        ]),
        total: expect.any(Number)
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
    req.method = 'GET';
    req.query = {};

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to get distributors list' });

    // Restore the original implementation
    jest.spyOn(global.Date, 'now').mockRestore();
  });

  it('should return at least one distributor', async () => {
    const { req, res } = createMocks();
    req.method = 'GET';
    req.query = {};

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const response = res.json.mock.calls[0][0];
    expect(response.distribuidoras.length).toBeGreaterThan(0);
    expect(response.total).toBeGreaterThan(0);
  });
});