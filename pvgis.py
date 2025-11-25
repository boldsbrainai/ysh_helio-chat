"""
PVGIS Router - Endpoints para cálculo de irradiação solar
"""
from fastapi import APIRouter, Depends, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.services.pvgis_service import (
    PVGISService,
    PVGISRequest,
    PVGISResponse
)
from app.core.dependencies import get_pvgis_service, get_redis_client
from app.core.config import get_settings
from app.core.exceptions import ExternalAPIError
import redis.asyncio as redis
import json
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/pvgis", tags=["solar-data"])
limiter = Limiter(key_func=get_remote_address)


@router.post(
    "/calculate",
    response_model=PVGISResponse,
    summary="Calcular produção solar via PVGIS"
)
@limiter.limit(get_settings().RATE_LIMIT_EXTERNAL_APIS)
async def calculate_solar_production(
    request: Request,
    params: PVGISRequest,
    pvgis_service: PVGISService = Depends(get_pvgis_service),
    redis_client: redis.Redis = Depends(get_redis_client)
):
    """
    @tool
    @name calculate_pvgis_solar_production
    @description Calcula a produção de energia solar fotovoltaica
    usando o PVGIS para uma determinada localização e configuração
    do sistema.
    @category solar_data
    @param {PVGISRequest} params - Os parâmetros para o cálculo
    da produção solar.
    @returns {PVGISResponse} Um objeto contendo os dados de produção
    e irradiação solar.
    """
    try:
        # Generate cache key
        cache_key = f"pvgis:{params.lat}:{params.lon}:{params.peakpower}"
        
        # Try Redis cache
        cached = await redis_client.get(cache_key)
        if cached:
            logger.info("✅ PVGIS Cache HIT: %s", cache_key)
            return json.loads(cached)
        
        # Call PVGIS service
        result = await pvgis_service.calculate_production(params)
        
        # Store in Redis with TTL
        await redis_client.setex(
            cache_key,
            get_settings().CACHE_TTL_PVGIS,
            json.dumps(result)
        )
        
        logger.info("💾 PVGIS cached: %s", cache_key)
        return result
        
    except Exception as e:
        logger.error("❌ PVGIS endpoint error: %s", str(e))
        raise ExternalAPIError(
            detail=f"Failed to calculate solar production: {e}"
        )


@router.get(
    "/irradiation",
    summary="Obter apenas irradiação (simplificado)"
)
@limiter.limit(get_settings().RATE_LIMIT_EXTERNAL_APIS)
async def get_irradiation(
    request: Request,
    lat: float,
    lon: float,
    pvgis_service: PVGISService = Depends(get_pvgis_service),
    redis_client: redis.Redis = Depends(get_redis_client)
):
    """
    @tool
    @name get_pvgis_irradiation
    @description Obtém dados de irradiação solar do PVGIS para uma
    determinada localização.
    @category solar_data
    @param {float} lat - A latitude da localização.
    @param {float} lon - A longitude da localização.
    @returns {object} Um objeto contendo os dados de irradiação solar.
    """
    try:
        # Generate cache key
        cache_key = f"pvgis:irradiation:{lat}:{lon}"

        # Try Redis cache
        cached = await redis_client.get(cache_key)
        if cached:
            logger.info("✅ PVGIS Irradiation Cache HIT: %s", cache_key)
            return json.loads(cached)

        params = PVGISRequest(
            lat=lat,
            lon=lon,
            peakpower=1.0,  # 1kWp padrão
        )
        
        result = await pvgis_service.calculate_production(params)
        
        response_data = {
            "lat": lat,
            "lon": lon,
            "irradiation": {
                "daily": result["E_d"],
                "monthly": result["E_m"],
                "annual": result["E_y"],
                "sun_hours": result["H_sun"]
            },
            "source": "PVGIS v5.2"
        }

        # Store in Redis
        await redis_client.setex(
            cache_key,
            get_settings().CACHE_TTL_PVGIS,
            json.dumps(response_data)
        )

        return response_data
        
    except Exception as e:
        logger.error("❌ Irradiation endpoint error: %s", str(e))
        raise ExternalAPIError(detail=f"Failed to get irradiation data: {e}")

