/**
 * Solar API Services
 * Client-side services to interact with serverless solar data APIs
 */

// Types for API responses
export interface PVGISResponse {
  E_d: number; // Daily production (kWh)
  E_m: number; // Monthly production (kWh)
  E_y: number; // Annual production (kWh)
  H_sun: number; // Equivalent sun hours
  SD_m: number; // Monthly standard deviation
  l_aoi: number; // Angle of incidence losses
  l_spec: number; // Spectral losses
  l_tg: number; // Temperature losses
  l_total: number; // Total losses
  location: {
    lat: number;
    lon: number;
    elevation: number;
  };
  system: {
    peakpower: number;
    loss: number;
    angle: number;
    aspect: number;
  };
  source: string;
}

export interface PVGISRequest {
  lat: number;
  lon: number;
  peakpower: number;
  loss?: number;
  angle?: number;
  aspect?: number;
  mountingplace?: string;
  pvtechchoice?: string;
}

export interface NASAResponse {
  irradiation_avg: number;
  temperature_avg: number;
  wind_speed_avg: number;
  precipitation_avg: number;
  humidity_avg: number;
  location: {
    lat: number;
    lon: number;
  };
  period: {
    start: string;
    end: string;
  };
  source: string;
}

export interface NASARequest {
  lat: number;
  lon: number;
  start_date?: string;
  end_date?: string;
  parameters?: string[];
}

export interface ANEELTariff {
  distribuidora: string;
  uf: string;
  classe: string;
  subclasse: string;
  modalidade: string;
  tarifa_media: number;
  ultima_atualizacao: string;
  tipo_leitura: string;
}

export interface ANEELTariffResponse {
  tariffs: ANEELTariff[];
  total: number;
  filters: {
    distribuidora: string | null;
    estado: string | null;
  };
}

/**
 * PVGIS Services
 */
export const pvgisService = {
  async calculateProduction(params: PVGISRequest): Promise<PVGISResponse> {
    try {
      const response = await fetch('/api/pvgis/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`PVGIS API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error calling PVGIS API:', error);
      throw error;
    }
  },

  async getIrradiation(lat: number, lon: number): Promise<any> {
    try {
      const response = await fetch(`/api/pvgis/irradiation?lat=${lat}&lon=${lon}`);

      if (!response.ok) {
        throw new Error(`PVGIS Irradiation API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error calling PVGIS Irradiation API:', error);
      throw error;
    }
  }
};

/**
 * NASA POWER Services
 */
export const nasaService = {
  async getClimateData(params: NASARequest): Promise<NASAResponse> {
    try {
      const response = await fetch('/api/nasa/climate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`NASA API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error calling NASA API:', error);
      throw error;
    }
  },

  async getIrradiation(lat: number, lon: number): Promise<any> {
    try {
      const response = await fetch(`/api/nasa/irradiation?lat=${lat}&lon=${lon}`);

      if (!response.ok) {
        throw new Error(`NASA Irradiation API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error calling NASA Irradiation API:', error);
      throw error;
    }
  }
};

/**
 * ANEEL Services
 */
export const aneelService = {
  async getTariffs(
    distribuidora: string | null = null,
    estado: string | null = null,
    limit: number = 100
  ): Promise<ANEELTariffResponse> {
    try {
      const params = new URLSearchParams();
      if (distribuidora) params.append('distribuidora', distribuidora);
      if (estado) params.append('estado', estado);
      params.append('limit', limit.toString());

      const response = await fetch(`/api/aneel/tariffs?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`ANEEL API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error calling ANEEL API:', error);
      throw error;
    }
  },

  async getDistribuidoras(): Promise<{ distribuidoras: string[]; total: number }> {
    try {
      const response = await fetch('/api/aneel/distribuidoras');

      if (!response.ok) {
        throw new Error(`ANEEL Distribuidoras API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error calling ANEEL Distribuidoras API:', error);
      throw error;
    }
  }
};