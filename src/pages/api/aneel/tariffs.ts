import { NextApiRequest, NextApiResponse } from 'next';

// Rate limiting configuration
const RATE_LIMIT = 50; // requests per hour (ANEEL data is expensive to retrieve)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Cache configuration
const cacheMap = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in ms (tariffs change infrequently)

// Mock ANEEL data service
const mockANEELTariffs = async (distribuidora: string | null, estado: string | null, limit: number) => {
  // Simulated ANEEL tariff data
  const mockTariffs = [
    {
      distribuidora: "CPFL Paulista",
      uf: "SP",
      classe: "Residencial",
      subclasse: "B1",
      modalidade: "Convencional",
      tarifa_media: 0.652,
      ultima_atualizacao: "2024-10-01",
      tipo_leitura: "Convencional"
    },
    {
      distribuidora: "AES Eletropaulo",
      uf: "SP",
      classe: "Residencial",
      subclasse: "B1",
      modalidade: "Convencional",
      tarifa_media: 0.724,
      ultima_atualizacao: "2024-10-01",
      tipo_leitura: "Convencional"
    },
    {
      distribuidora: "Light Serviços",
      uf: "RJ",
      classe: "Residencial",
      subclasse: "B1",
      modalidade: "Convencional",
      tarifa_media: 0.687,
      ultima_atualizacao: "2024-10-01",
      tipo_leitura: "Convencional"
    },
    {
      distribuidora: "Neoenergia Rio",
      uf: "RJ",
      classe: "Residencial",
      subclasse: "B1",
      modalidade: "Convencional",
      tarifa_media: 0.701,
      ultima_atualizacao: "2024-10-01",
      tipo_leitura: "Convencional"
    },
    {
      distribuidora: "CEMIG",
      uf: "MG",
      classe: "Residencial",
      subclasse: "B1",
      modalidade: "Convencional",
      tarifa_media: 0.612,
      ultima_atualizacao: "2024-10-01",
      tipo_leitura: "Convencional"
    },
    {
      distribuidora: "Coelba",
      uf: "BA",
      classe: "Residencial",
      subclasse: "B1",
      modalidade: "Convencional",
      tarifa_media: 0.698,
      ultima_atualizacao: "2024-10-01",
      tipo_leitura: "Convencional"
    },
    {
      distribuidora: "CELPE",
      uf: "PE",
      classe: "Residencial",
      subclasse: "B1",
      modalidade: "Convencional",
      tarifa_media: 0.675,
      ultima_atualizacao: "2024-10-01",
      tipo_leitura: "Convencional"
    },
    {
      distribuidora: "Eletrobras", 
      uf: "AC,AL,AM,AP,CE,MA,PA,PI,RR,RO,TO",
      classe: "Residencial",
      subclasse: "B1",
      modalidade: "Convencional",
      tarifa_media: 0.723,
      ultima_atualizacao: "2024-10-01",
      tipo_leitura: "Convencional"
    }
  ];

  let filtered = mockTariffs;

  if (distribuidora) {
    filtered = filtered.filter(t => 
      t.distribuidora.toLowerCase().includes(distribuidora.toLowerCase())
    );
  }

  if (estado) {
    filtered = filtered.filter(t => 
      t.uf === estado.toUpperCase() || t.uf.includes(estado.toUpperCase())
    );
  }

  return filtered.slice(0, limit);
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

    const { distribuidora, estado, limit = 100 } = req.query;
    const limitNum = parseInt(limit as string) || 100;

    // Create cache key
    const cacheKey = `aneel:tariffs:${distribuidora || 'all'}:${estado || 'all'}`;
    
    // Check cache first
    if (cacheMap.has(cacheKey)) {
      const cachedData = cacheMap.get(cacheKey)!;
      if (now - cachedData.timestamp < CACHE_TTL) {
        console.log('ANEEL Cache HIT:', cacheKey);
        return res.status(200).json(cachedData.data);
      }
    }

    console.log('ANEEL Tariffs API call:', { distribuidora, estado, limit: limitNum });

    // Get tariff data
    const tariffs = await mockANEELTariffs(
      distribuidora ? distribuidora.toString() : null,
      estado ? estado.toString() : null,
      limitNum
    );

    const result = {
      tariffs,
      total: tariffs.length,
      filters: {
        distribuidora: distribuidora || null,
        estado: estado || null
      }
    };

    // Cache result
    cacheMap.set(cacheKey, { data: result, timestamp: now });

    res.status(200).json(result);
  } catch (error) {
    console.error('ANEEL tariffs endpoint error:', error);
    res.status(500).json({ error: 'Failed to get tariff data' });
  }
}