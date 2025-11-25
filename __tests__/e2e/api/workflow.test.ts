/**
 * End-to-End API Workflow Tests
 * Tests complete API workflows simulating real user interactions
 */

import { NextApiRequest } from 'next';

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
}

// Import all API handlers
import pvgisCalculateHandler from '../../../src/pages/api/pvgis/calculate';
import pvgisIrradiationHandler from '../../../src/pages/api/pvgis/irradiation';
import nasaClimateHandler from '../../../src/pages/api/nasa/climate';
import nasaIrradiationHandler from '../../../src/pages/api/nasa/irradiation';
import aneelTariffsHandler from '../../../src/pages/api/aneel/tariffs';
import aneelDistribuidorasHandler from '../../../src/pages/api/aneel/distribuidoras';

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

describe('Solar Data API End-to-End Workflows', () => {
  beforeEach(() => {
    // Clear all rate limit and cache maps
    [pvgisCalculateHandler, pvgisIrradiationHandler, nasaClimateHandler, 
     nasaIrradiationHandler, aneelTariffsHandler, aneelDistribuidorasHandler].forEach(handler => {
      if ((handler as any).rateLimitMap) {
        (handler as any).rateLimitMap.clear();
      }
      if ((handler as any).cacheMap) {
        (handler as any).cacheMap.clear();
      }
    });
  });

  it('should complete a full solar assessment workflow', async () => {
    // Step 1: Get irradiation data from NASA for location
    const nasaReq = new MockNextApiRequest({
      method: 'GET',
      query: {
        lat: '-23.5505',
        lon: '-46.6333'
      }
    });

    const nasaRes = new MockNextApiResponse();
    await (nasaIrradiationHandler as any)(nasaReq, nasaRes);

    expect(nasaRes.getStatusCode()).toBe(200);
    const nasaData = nasaRes.getJsonData();
    expect(nasaData.irradiation_kwh_m2_day).toBeGreaterThan(0);

    // Step 2: Get detailed climate data from NASA
    const climateReq = new MockNextApiRequest({
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: {
        lat: -23.5505,
        lon: -46.6333
      },
    });

    const climateRes = new MockNextApiResponse();
    await (nasaClimateHandler as any)(climateReq, climateRes);

    expect(climateRes.getStatusCode()).toBe(200);
    const climateData = climateRes.getJsonData();
    expect(climateData.irradiation_avg).toBeGreaterThan(0);
    expect(climateData.temperature_avg).toBeGreaterThan(-100); // Valid temperature

    // Step 3: Get irradiation data from PVGIS for comparison
    const pvgisIrradReq = new MockNextApiRequest({
      method: 'GET',
      query: {
        lat: '-23.5505',
        lon: '-46.6333'
      }
    });

    const pvgisIrradRes = new MockNextApiResponse();
    await (pvgisIrradiationHandler as any)(pvgisIrradReq, pvgisIrradRes);

    expect(pvgisIrradRes.getStatusCode()).toBe(200);
    const pvgisIrradData = pvgisIrradRes.getJsonData();
    expect(pvgisIrradData.irradiation.daily).toBeGreaterThan(0);

    // Step 4: Calculate solar production with PVGIS
    const pvgisCalcReq = new MockNextApiRequest({
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: {
        lat: -23.5505,
        lon: -46.6333,
        peakpower: 5.0
      },
    });

    const pvgisCalcRes = new MockNextApiResponse();
    await (pvgisCalculateHandler as any)(pvgisCalcReq, pvgisCalcRes);

    expect(pvgisCalcRes.getStatusCode()).toBe(200);
    const pvgisCalcData = pvgisCalcRes.getJsonData();
    expect(pvgisCalcData.E_y).toBeGreaterThan(0); // Annual production should be > 0

    // Step 5: Get ANEEL tariff data for the region
    const aneelReq = new MockNextApiRequest({
      method: 'GET',
      query: {
        estado: 'SP'
      }
    });

    const aneelRes = new MockNextApiResponse();
    await (aneelTariffsHandler as any)(aneelReq, aneelRes);

    expect(aneelRes.getStatusCode()).toBe(200);
    const aneelData = aneelRes.getJsonData();
    expect(aneelData.tariffs).toBeInstanceOf(Array);
    expect(aneelData.total).toBeGreaterThan(0);

    // Verify that all steps in the workflow completed successfully
    expect(nasaData.irradiation_kwh_m2_day).toBeGreaterThan(0);
    expect(climateData.irradiation_avg).toBeGreaterThan(0);
    expect(pvgisIrradData.irradiation.daily).toBeGreaterThan(0);
    expect(pvgisCalcData.E_y).toBeGreaterThan(0);
    expect(aneelData.total).toBeGreaterThan(0);
  });

  it('should handle solar project estimation workflow', async () => {
    // Simulate a complete workflow for solar project estimation
    const location = { lat: -23.5505, lon: -46.6333 };

    // 1. Get irradiation data
    const irradiationReq = new MockNextApiRequest({
      method: 'GET',
      query: {
        lat: String(location.lat),
        lon: String(location.lon)
      }
    });

    const irradiationRes = new MockNextApiResponse();
    await (nasaIrradiationHandler as any)(irradiationReq, irradiationRes);

    const irradiationData = irradiationRes.getJsonData();
    expect(irradiationRes.getStatusCode()).toBe(200);
    expect(irradiationData.irradiation_kwh_m2_day).toBeGreaterThan(0);

    // 2. Calculate potential solar production for various system sizes
    const systemSizes = [3, 5, 8, 10];
    const productions = [];

    for (const size of systemSizes) {
      const calcReq = new MockNextApiRequest({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: {
          lat: location.lat,
          lon: location.lon,
          peakpower: size
        },
      });

      const calcRes = new MockNextApiResponse();
      await (pvgisCalculateHandler as any)(calcReq, calcRes);

      expect(calcRes.getStatusCode()).toBe(200);
      const calcData = calcRes.getJsonData();
      expect(calcData.E_y).toBeGreaterThan(0);
      productions.push(calcData.E_y);
    }

    // Verify that larger systems produce more energy
    for (let i = 1; i < productions.length; i++) {
      expect(productions[i]).toBeGreaterThan(productions[i-1]);
    }

    // 3. Get tariff data for economic analysis
    const tariffReq = new MockNextApiRequest({
      method: 'GET',
      query: {
        estado: 'SP',
        limit: '5'
      }
    });

    const tariffRes = new MockNextApiResponse();
    await (aneelTariffsHandler as any)(tariffReq, tariffRes);

    expect(tariffRes.getStatusCode()).toBe(200);
    const tariffData = tariffRes.getJsonData();
    expect(tariffData.tariffs).toBeInstanceOf(Array);
    expect(tariffData.tariffs.length).toBeLessThanOrEqual(5);

    // 4. Get list of distributors
    const distReq = new MockNextApiRequest({
      method: 'GET'
    });

    const distRes = new MockNextApiResponse();
    await (aneelDistribuidorasHandler as any)(distReq, distRes);

    expect(distRes.getStatusCode()).toBe(200);
    const distData = distRes.getJsonData();
    expect(distData.distribuidoras).toBeInstanceOf(Array);
    expect(distData.total).toBeGreaterThan(0);
  });

  it('should handle error propagation across API workflow', async () => {
    // Test how errors are propagated when invalid coordinates are used
    const invalidReq = new MockNextApiRequest({
      method: 'GET',
      query: {
        lat: 'invalid',
        lon: '-46.6333'
      }
    });

    const invalidRes = new MockNextApiResponse();
    await (nasaIrradiationHandler as any)(invalidReq, invalidRes);

    expect(invalidRes.getStatusCode()).toBe(500);

    // Test with invalid coordinates format
    const invalidCoordReq = new MockNextApiRequest({
      method: 'GET',
      query: {
        lat: '1000', // Out of range
        lon: '-46.6333'
      }
    });

    const invalidCoordRes = new MockNextApiResponse();
    await (pvgisIrradiationHandler as any)(invalidCoordReq, invalidCoordRes);

    expect(invalidCoordRes.getStatusCode()).toBe(400);
    const errorData = invalidCoordRes.getJsonData();
    expect(errorData.error).toBe('Invalid lat/lon coordinates');
  });
});