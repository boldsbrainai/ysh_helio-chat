import { NextApiRequest, NextApiResponse } from 'next';

// Rate limiting configuration
const RATE_LIMIT = 100; // requests per hour
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Cache configuration
const cacheMap = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in ms

// Mock NASA POWER service implementation
const mockNASAClimateData = async (params: any) => {
  // In a real implementation, this would call the actual NASA POWER API
  // For now, we'll simulate the response with realistic values
  
  const { lat, lon, start_date, end_date, parameters } = params;
  
  // Calculate based on location and time
  // These are simplified calculations based on typical NASA POWER response patterns
  
  // Determine period: if not specified, use last 12 months
  const startDate = start_date ? new Date(start_date) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  const endDate = end_date ? new Date(end_date) : new Date();
  
  // Simulate climate data
  const baseSolar = 4.5; // kWh/m2/day
  const baseTemp = 22 + (lat > 0 ? -0.6 * (Math.abs(lat) / 90) : 0.6 * (Math.abs(lat) / 90)); // Adjust for latitude
  const baseWind = 2.5 + Math.random() * 1.5;
  const basePrecip = 100 + Math.random() * 50;
  const baseHumidity = 65 + (lat > 0 ? -0.5 * (Math.abs(lat) / 90) : 0.5 * (Math.abs(lat) / 90)); // Adjust for latitude
  
  return {
    irradiation_avg: baseSolar,
    temperature_avg: baseTemp,
    wind_speed_avg: baseWind,
    precipitation_avg: basePrecip,
    humidity_avg: baseHumidity,
    location: {
      lat,
      lon
    },
    period: {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    },
    source: "NASA POWER Simulation"
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

    const { lat, lon, start_date, end_date, parameters } = req.body;

    // Validate required parameters
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Missing required parameters: lat, lon' });
    }

    // Validate parameter ranges
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({ error: 'Invalid lat/lon coordinates' });
    }

    // Create cache key
    const cacheKey = `nasa:${lat}:${lon}:${start_date || 'default'}`;
    
    // Check cache first
    if (cacheMap.has(cacheKey)) {
      const cachedData = cacheMap.get(cacheKey)!;
      if (now - cachedData.timestamp < CACHE_TTL) {
        console.log('NASA Cache HIT:', cacheKey);
        return res.status(200).json(cachedData.data);
      }
    }

    console.log('NASA Climate API call:', { lat, lon });

    // Perform calculation
    const result = await mockNASAClimateData({
      lat,
      lon,
      start_date,
      end_date,
      parameters: parameters || ['ALLSKY_SFC_SW_DWN', 'T2M', 'WS10M', 'PRECTOTCORR', 'RH2M']
    });

    // Cache result
    cacheMap.set(cacheKey, { data: result, timestamp: now });

    res.status(200).json(result);
  } catch (error) {
    console.error('NASA endpoint error:', error);
    res.status(500).json({ error: 'Failed to get climate data' });
  }
}