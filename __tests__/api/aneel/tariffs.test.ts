import { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../../src/pages/api/aneel/tariffs';

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

describe('ANEEL Tariffs API - Unit Tests', () => {
  beforeEach(() => {
    // Reset rate limit and cache maps
    (handler as any).rateLimitMap = new Map();
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

  it('should return valid response for valid request without filters', async () => {
    const { req, res } = createMocks();
    req.method = 'GET';
    req.query = {};

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        tariffs: expect.arrayContaining([
          expect.objectContaining({
            distribuidora: expect.any(String),
            uf: expect.any(String),
            classe: expect.any(String),
            subclasse: expect.any(String),
            modalidade: expect.any(String),
            tarifa_media: expect.any(Number),
            ultima_atualizacao: expect.any(String),
            tipo_leitura: expect.any(String)
          })
        ]),
        total: expect.any(Number),
        filters: {
          distribuidora: null,
          estado: null
        }
      })
    );
  });

  it('should return valid response with distribuidora filter', async () => {
    const { req, res } = createMocks();
    req.method = 'GET';
    req.query = {
      distribuidora: 'CPFL'
    };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const response = res.json.mock.calls[0][0];
    expect(response.filters.distribuidora).toBe('CPFL');
  });

  it('should return valid response with estado filter', async () => {
    const { req, res } = createMocks();
    req.method = 'GET';
    req.query = {
      estado: 'SP'
    };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const response = res.json.mock.calls[0][0];
    expect(response.filters.estado).toBe('SP');
  });

  it('should return valid response with limit parameter', async () => {
    const { req, res } = createMocks();
    req.method = 'GET';
    req.query = {
      limit: '10'
    };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    // The response should have at most 10 items in the tariffs array
    const response = res.json.mock.calls[0][0];
    expect(response.tariffs.length).toBeLessThanOrEqual(10);
  });

  it('should handle string limit parameter', async () => {
    const { req, res } = createMocks();
    req.method = 'GET';
    req.query = {
      limit: '5'
    };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should return 429 when rate limit is exceeded', async () => {
    const { req, res } = createMocks();
    req.method = 'GET';
    req.query = {};
    req.headers['x-forwarded-for'] = '127.0.0.1';

    // Simulate rate limit being exceeded
    const rateLimitMap = new Map();
    rateLimitMap.set('127.0.0.1', { count: 100, resetTime: Date.now() + 3600000 }); // 1 hour in future
    (handler as any).rateLimitMap = rateLimitMap;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({ error: 'Rate limit exceeded' });
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
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to get tariff data' });

    // Restore the original implementation
    jest.spyOn(global.Date, 'now').mockRestore();
  });
});