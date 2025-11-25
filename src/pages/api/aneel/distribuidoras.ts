import { NextApiRequest, NextApiResponse } from 'next';

// Cache configuration
const cacheMap = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in ms

// Mock ANEEL distributors service
const mockANEELDistributors = async () => {
  // Simulated list of Brazilian energy distributors
  const distributors = [
    "AES Eletropaulo",
    "CPFL Paulista", 
    "CPFL Piratininga",
    "CPFL Santa Cruz",
    "Light Serviços",
    "Neoenergia Rio",
    "CEMIG",
    "Coelba",
    "CELPE",
    "Eletrobras",
    "Neoenergia",
    "Enel",
    "RGE",
    "CERON",
    "EBO",
    "CDA",
    "ESCELSA",
    "CEEE",
    "Amazonas Energia",
    "CELG",
    "CMIG",
    "COSERN",
    "Energisa",
    "RGE Sul"
  ];
  
  return distributors;
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
    // Create cache key
    const cacheKey = 'aneel:distribuidoras:all';
    const now = Date.now();
    
    // Check cache first
    if (cacheMap.has(cacheKey)) {
      const cachedData = cacheMap.get(cacheKey)!;
      if (now - cachedData.timestamp < CACHE_TTL) {
        console.log('ANEEL Distribuidoras Cache HIT:', cacheKey);
        return res.status(200).json(cachedData.data);
      }
    }

    console.log('ANEEL Distribuidoras API call');

    // Get distributors
    const distributors = await mockANEELDistributors();

    const result = {
      distribuidoras: distributors,
      total: distributors.length
    };

    // Cache result
    cacheMap.set(cacheKey, { data: result, timestamp: now });

    res.status(200).json(result);
  } catch (error) {
    console.error('ANEEL distributors endpoint error:', error);
    res.status(500).json({ error: 'Failed to get distributors list' });
  }
}