"""
NASA Router - Endpoints para dados climáticos
"""
from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from ..services.nasa_service import nasa_service, NASARequest, NASAResponse
from ..core.config import settings
import json
import logging

logger = logging.getLogger(__name__)

from app.core.security import acp_authorizer
from fastapi import Depends

router = APIRouter(
    prefix="/nasa",
    tags=["climate-data"],
    dependencies=[Depends(acp_authorizer)],
)
limiter = Limiter(key_func=get_remote_address)


@router.post(
    "/climate",
    response_model=NASAResponse,
    summary="Obter dados climáticos via NASA POWER"
)
@limiter.limit(settings.RATE_LIMIT_EXTERNAL_APIS)
async def get_climate_data(
    request: Request,
    params: NASARequest
):
    """
    @tool
    @name get_nasa_climate_data
    @description Obtém dados climáticos da NASA POWER para uma determinada localização e período.
    @category climate_data
    @param {NASARequest} params - Os parâmetros para a consulta de dados climáticos.
    @returns {NASAResponse} Um objeto contendo os dados climáticos agregados.
    """
    try:
        # Generate cache key
        cache_key = f"nasa:{params.lat}:{params.lon}:{params.start_date or 'default'}"
        
        # Try Redis cache
        cached = await request.app.state.redis.get(cache_key)
        if cached:
            logger.info(f"✅ NASA Cache HIT: {cache_key}")
            return json.loads(cached)
        
        # Call NASA service
        result = await nasa_service.get_climate_data(params)
        
        # Store in Redis
        await request.app.state.redis.setex(
            cache_key,
            settings.CACHE_TTL_NASA,
            json.dumps(result)
        )
        
        logger.info(f"💾 NASA cached: {cache_key}")
        return result
        
    except Exception as e:
        logger.error(f"❌ NASA endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/irradiation",
    summary="Obter apenas irradiação NASA (simplificado)"
)
@limiter.limit(settings.RATE_LIMIT_EXTERNAL_APIS)
async def get_nasa_irradiation(
    request: Request,
    lat: float,
    lon: float
):
    """
    @tool
    @name get_nasa_irradiation
    @description Obtém dados de irradiação solar da NASA POWER para uma determinada localização.
    @category climate_data
    @param {float} lat - A latitude da localização.
    @param {float} lon - A longitude da localização.
    @returns {object} Um objeto contendo os dados de irradiação.
    """
    try:
        # Generate cache key
        cache_key = f"nasa:irradiation:{lat}:{lon}"

        # Try Redis cache
        cached = await request.app.state.redis.get(cache_key)
        if cached:
            logger.info(f"✅ NASA Irradiation Cache HIT: {cache_key}")
            return json.loads(cached)

        params = NASARequest(lat=lat, lon=lon)
        result = await nasa_service.get_climate_data(params)
        
        response_data = {
            "lat": lat,
            "lon": lon,
            "irradiation_kwh_m2_day": result["irradiation_avg"],
            "source": "NASA POWER"
        }

        # Store in Redis
        await request.app.state.redis.setex(
            cache_key,
            settings.CACHE_TTL_NASA,
            json.dumps(response_data)
        )

        return response_data
        
    except Exception as e:
        logger.error(f"❌ NASA irradiation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

