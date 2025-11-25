"""
PVGIS Service - Proxy para API de irradiação solar
"""
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential
from typing import Dict, Any
from pydantic import BaseModel, Field
from app.core.config import settings
from app.core.cache import redis_cache
import logging

logger = logging.getLogger(__name__)


class PVGISRequest(BaseModel):
    """Request schema para cálculo PVGIS"""
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)
    peakpower: float = Field(..., gt=0, description="Sistema em kWp")
    loss: float = Field(default=14, ge=0, le=100, description="Perdas do sistema (%)")
    angle: int = Field(default=30, ge=0, le=90, description="Inclinação dos painéis")
    aspect: int = Field(default=0, ge=-180, le=180, description="Azimute (0=Sul)")
    mountingplace: str = Field(default="free", description="free ou building")
    pvtechchoice: str = Field(default="crystSi", description="Tecnologia do painel")


class PVGISResponse(BaseModel):
    """Response schema PVGIS"""
    E_d: float = Field(..., description="Produção diária média (kWh)")
    E_m: float = Field(..., description="Produção mensal média (kWh)")
    E_y: float = Field(..., description="Produção anual (kWh)")
    H_sun: float = Field(..., description="Horas de sol equivalente")
    SD_m: float = Field(..., description="Desvio padrão mensal")
    l_aoi: float = Field(..., description="Perda por ângulo de incidência (%)")
    l_spec: float = Field(..., description="Perda espectral (%)")
    l_tg: float = Field(..., description="Perda por temperatura (%)")
    l_total: float = Field(..., description="Perda total (%)")


class PVGISService:
    """Service para interagir com PVGIS API"""
    
    def __init__(self):
        self.base_url = settings.PVGIS_BASE_URL
        self.timeout = settings.HTTP_TIMEOUT
    
    @retry(
        stop=stop_after_attempt(settings.RETRY_MAX_ATTEMPTS),
        wait=wait_exponential(
            multiplier=settings.RETRY_WAIT_EXPONENTIAL_MULTIPLIER,
            max=settings.RETRY_WAIT_EXPONENTIAL_MAX
        )
    )
    @redis_cache(ttl=settings.CACHE_TTL_PVGIS)
    async def calculate_production(
        self,
        params: PVGISRequest
    ) -> Dict[str, Any]:
        """
        Calcula produção solar usando PVGIS
        
        Args:
            params: Parâmetros do sistema solar
            
        Returns:
            Dados de produção e irradiação
        """
        try:
            url = f"{self.base_url}/PVcalc"
            
            query_params = {
                "lat": params.lat,
                "lon": params.lon,
                "peakpower": params.peakpower,
                "loss": params.loss,
                "angle": params.angle,
                "aspect": params.aspect,
                "mountingplace": params.mountingplace,
                "pvtechchoice": params.pvtechchoice,
                "outputformat": "json",
            }
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                logger.info(f"📡 PVGIS request: lat={params.lat}, lon={params.lon}")
                response = await client.get(url, params=query_params)
                response.raise_for_status()
                
                data = response.json()
                
                # Extrair dados relevantes
                outputs = data.get("outputs", {})
                totals = outputs.get("totals", {})
                
                result = {
                    "E_d": totals.get("fixed", {}).get("E_d", 0),
                    "E_m": totals.get("fixed", {}).get("E_m", 0),
                    "E_y": totals.get("fixed", {}).get("E_y", 0),
                    "H_sun": totals.get("fixed", {}).get("H_sun", 0),
                    "SD_m": totals.get("fixed", {}).get("SD_m", 0),
                    "l_aoi": totals.get("fixed", {}).get("l_aoi", 0),
                    "l_spec": totals.get("fixed", {}).get("l_spec", 0),
                    "l_tg": totals.get("fixed", {}).get("l_tg", 0),
                    "l_total": totals.get("fixed", {}).get("l_total", 0),
                    "location": {
                        "lat": params.lat,
                        "lon": params.lon,
                        "elevation": outputs.get("location", {}).get("elevation", 0)
                    },
                    "system": {
                        "peakpower": params.peakpower,
                        "loss": params.loss,
                        "angle": params.angle,
                        "aspect": params.aspect
                    },
                    "source": "PVGIS v5.2"
                }
                
                logger.info(f"✅ PVGIS response: E_y={result['E_y']} kWh/year")
                return result
                
        except httpx.HTTPStatusError as e:
            logger.error(f"❌ PVGIS HTTP error: {e.response.status_code}")
            raise
        except Exception as e:
            logger.error(f"❌ PVGIS error: {str(e)}")
            raise


# Singleton instance
pvgis_service = PVGISService()

