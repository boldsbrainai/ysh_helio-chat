"""
NASA POWER Service - Proxy para dados climáticos
"""
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential
from typing import Dict, Any, List
from pydantic import BaseModel, Field
from app.core.config import settings
from app.core.cache import redis_cache
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class NASARequest(BaseModel):
    """Request schema para NASA POWER"""
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)
    start_date: str = Field(default=None, description="YYYYMMDD format")
    end_date: str = Field(default=None, description="YYYYMMDD format")
    parameters: List[str] = Field(
        default=[
            "ALLSKY_SFC_SW_DWN",  # Irradiação solar
            "T2M",  # Temperatura a 2m
            "WS10M",  # Velocidade vento 10m
            "PRECTOTCORR",  # Precipitação
            "RH2M"  # Umidade relativa
        ]
    )


class NASAResponse(BaseModel):
    """Response schema NASA POWER"""
    irradiation_avg: float = Field(..., description="Irradiação média (kWh/m2/dia)")
    temperature_avg: float = Field(..., description="Temperatura média (°C)")
    wind_speed_avg: float = Field(..., description="Velocidade vento (m/s)")
    precipitation_avg: float = Field(..., description="Precipitação (mm/dia)")
    humidity_avg: float = Field(..., description="Umidade relativa (%)")


class NASAService:
    """Service para interagir com NASA POWER API"""
    
    def __init__(self):
        self.base_url = settings.NASA_POWER_BASE_URL
        self.timeout = settings.HTTP_TIMEOUT
    
    @retry(
        stop=stop_after_attempt(settings.RETRY_MAX_ATTEMPTS),
        wait=wait_exponential(
            multiplier=settings.RETRY_WAIT_EXPONENTIAL_MULTIPLIER,
            max=settings.RETRY_WAIT_EXPONENTIAL_MAX
        )
    )
    @redis_cache(ttl=settings.CACHE_TTL_NASA)
    async def get_climate_data(
        self,
        params: NASARequest
    ) -> Dict[str, Any]:
        """
        Obtém dados climáticos da NASA POWER
        
        Args:
            params: Parâmetros de localização e período
            
        Returns:
            Dados climáticos agregados
        """
        try:
            # Default: último ano de dados
            if not params.start_date or not params.end_date:
                end = datetime.now()
                start = end - timedelta(days=365)
                params.start_date = start.strftime("%Y%m%d")
                params.end_date = end.strftime("%Y%m%d")
            
            url = f"{self.base_url}/temporal/daily/point"
            
            query_params = {
                "latitude": params.lat,
                "longitude": params.lon,
                "start": params.start_date,
                "end": params.end_date,
                "parameters": ",".join(params.parameters),
                "community": "RE",  # Renewable Energy
                "format": "JSON"
            }
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                logger.info(f"📡 NASA POWER request: lat={params.lat}, lon={params.lon}")
                response = await client.get(url, params=query_params)
                response.raise_for_status()
                
                data = response.json()
                properties = data.get("properties", {}).get("parameter", {})
                
                # Calcular médias
                def calculate_avg(param_data: Dict) -> float:
                    values = [v for v in param_data.values() if v != -999.0]
                    return sum(values) / len(values) if values else 0.0
                
                result = {
                    "irradiation_avg": calculate_avg(
                        properties.get("ALLSKY_SFC_SW_DWN", {})
                    ),
                    "temperature_avg": calculate_avg(
                        properties.get("T2M", {})
                    ),
                    "wind_speed_avg": calculate_avg(
                        properties.get("WS10M", {})
                    ),
                    "precipitation_avg": calculate_avg(
                        properties.get("PRECTOTCORR", {})
                    ),
                    "humidity_avg": calculate_avg(
                        properties.get("RH2M", {})
                    ),
                    "location": {
                        "lat": params.lat,
                        "lon": params.lon
                    },
                    "period": {
                        "start": params.start_date,
                        "end": params.end_date
                    },
                    "source": "NASA POWER"
                }
                
                logger.info(
                    f"✅ NASA response: irr={result['irradiation_avg']:.2f} kWh/m2/day"
                )
                return result
                
        except httpx.HTTPStatusError as e:
            logger.error(f"❌ NASA POWER HTTP error: {e.response.status_code}")
            raise
        except Exception as e:
            logger.error(f"❌ NASA POWER error: {str(e)}")
            raise


# Singleton instance
nasa_service = NASAService()

