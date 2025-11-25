import { NextApiRequest, NextApiResponse } from 'next';

// Rate limiting configuration
const RATE_LIMIT = 100; // requests per hour
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Cache configuration
const cacheMap = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in ms

// Mock PVGIS service implementation
const mockPVGISCalculation = async (params: any) => {
  // In a real implementation, this would call the actual PVGIS API
  // For now, we'll simulate the response with realistic values
  
  const { lat, lon, peakpower, loss = 14, angle = 30, aspect = 0 } = params;
  
  // Calculate based on location and system parameters
  // These are simplified calculations based on typical PVGIS response patterns
  const baseProduction = 4.5; // kWh/kWp/day average for Brazil
  const latitudeFactor = 1 - Math.abs(lat) / 90; // Adjust for latitude
  const seasonalFactor = 1.0; // Simplified seasonal adjustment
  
  const annualProduction = baseProduction * peakpower * 365 * latitudeFactor * seasonalFactor;
  const monthlyProduction = annualProduction / 12;
  const dailyProduction = baseProduction * peakpower * latitudeFactor * seasonalFactor;
  
  // Apply losses
  const systemLosses = loss / 100;
  const netAnnual = annualProduction * (1 - systemLosses);
  const netMonthly = monthlyProduction * (1 - systemLosses);
  const netDaily = dailyProduction * (1 - systemLosses);
  
  return {
    E_d: netDaily,
    E_m: netMonthly,
    E_y: netAnnual,
    H_sun: netDaily, // Simplified equivalent sun hours
    SD_m: netMonthly * 0.1, // 10% variation
    l_aoi: 2.5, // Angle of incidence losses
    l_spec: 1.0, // Spectral losses
    l_tg: 3.0, // Temperature losses
    l_total: loss,
    location: {
      lat,
      lon,
      elevation: Math.random() * 1000 // Mock elevation
    },
    system: {
      peakpower,
      loss,
      angle,
      aspect
    },
    source: "PVGIS Simulation"
  };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Rate limiting
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const hourAgo = now - 60 * 60 * 1000;
    
    if (!rateLimitMap.has(clientIP.toString())) {
      rateLimitMap.set(clientIP.toString(), { count: 1, resetTime: now + 60 * 60 * 1000 });
    } else {
      const limitInfo = rateLimitMap.get(clientIP.toString())!;
      
      if (now > limitInfo.resetTime) {
        // Reset counter after hour
        rateLimitMap.set(clientIP.toString(), { count: 1, resetTime: now + 60 * 60 * 1000 });
      } else {
        if (limitInfo.count >= RATE_LIMIT) {
          return res.status(429).json({ error: 'Rate limit exceeded' });
        } else {
          limitInfo.count++;
        }
      }
    }

    const { lat, lon, peakpower, loss, angle, aspect, mountingplace, pvtechchoice } = req.body;

    // Validate required parameters
    if (!lat || !lon || !peakpower) {
      return res.status(400).json({ error: 'Missing required parameters: lat, lon, peakpower' });
    }

    // Validate parameter ranges
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({ error: 'Invalid lat/lon coordinates' });
    }

    if (peakpower <= 0) {
      return res.status(400).json({ error: 'Peak power must be greater than 0' });
    }

    // Create cache key
    const cacheKey = `pvgis:${lat}:${lon}:${peakpower}:${loss || 14}`;
    
    // Check cache first
    if (cacheMap.has(cacheKey)) {
      const cachedData = cacheMap.get(cacheKey)!;
      if (now - cachedData.timestamp < CACHE_TTL) {
        console.log('PVGIS Cache HIT:', cacheKey);
        return res.status(200).json(cachedData.data);
      }
    }

    console.log('PVGIS API call:', { lat, lon, peakpower });

    // Perform calculation
    const result = await mockPVGISCalculation({
      lat,
      lon,
      peakpower,
      loss,
      angle,
      aspect,
      mountingplace,
      pvtechchoice
    });

    // Cache result
    cacheMap.set(cacheKey, { data: result, timestamp: now });

    res.status(200).json(result);
  } catch (error) {
    console.error('PVGIS endpoint error:', error);
    res.status(500).json({ error: 'Failed to calculate solar production' });
  }
}