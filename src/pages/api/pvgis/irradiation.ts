import { NextApiRequest, NextApiResponse } from 'next';

// Cache configuration
const cacheMap = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in ms

// Mock PVGIS irradiation service
const mockPVGISSimpleIrradiation = async (lat: number, lon: number) => {
  // Simplified calculation for irradiation only
  const baseIrradiation = 4.5; // kWh/m²/day average for Brazil
  const latitudeFactor = 1 - Math.abs(lat) / 90; // Adjust for latitude
  
  const daily = baseIrradiation * latitudeFactor;
  const monthly = daily * 30.5; // Average days in a month
  const annual = daily * 365;
  
  return {
    lat,
    lon,
    irradiation: {
      daily,
      monthly,
      annual,
      sun_hours: daily // Simplified equivalent
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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Missing required parameters: lat, lon' });
    }

    const latNum = parseFloat(lat as string);
    const lonNum = parseFloat(lon as string);

    // Validate parameter ranges
    if (latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) {
      return res.status(400).json({ error: 'Invalid lat/lon coordinates' });
    }

    // Create cache key
    const cacheKey = `pvgis:irradiation:${latNum}:${lonNum}`;
    const now = Date.now();
    
    // Check cache first
    if (cacheMap.has(cacheKey)) {
      const cachedData = cacheMap.get(cacheKey)!;
      if (now - cachedData.timestamp < CACHE_TTL) {
        console.log('PVGIS Irradiation Cache HIT:', cacheKey);
        return res.status(200).json(cachedData.data);
      }
    }

    console.log('PVGIS Irradiation API call:', { lat: latNum, lon: lonNum });

    // Get irradiation data
    const result = await mockPVGISSimpleIrradiation(latNum, lonNum);

    // Cache result
    cacheMap.set(cacheKey, { data: result, timestamp: now });

    res.status(200).json(result);
  } catch (error) {
    console.error('PVGIS irradiation endpoint error:', error);
    res.status(500).json({ error: 'Failed to get irradiation data' });
  }
}