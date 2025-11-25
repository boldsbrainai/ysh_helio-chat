"""
ANEEL Router - Endpoints para tarifas e distribuidoras
"""
from fastapi import APIRouter, HTTPException, Request, Query, BackgroundTasks
from slowapi import Limiter
from slowapi.util import get_remote_address
from ..services.aneel_service import aneel_service
from ..core.config import settings
from ..core.database import AsyncSessionLocal
import json
import logging

logger = logging.getLogger(__name__)

from app.core.security import acp_authorizer
from fastapi import Depends

router = APIRouter(
    prefix="/aneel",
    tags=["energy-data"],
    dependencies=[Depends(acp_authorizer)],
)
limiter = Limiter(key_func=get_remote_address)


@router.get(
    "/tariffs",
    summary="Obter tarifas de distribuidoras"
)
@limiter.limit(settings.RATE_LIMIT_EXTERNAL_APIS)
async def get_tariffs(
    request: Request,
    distribuidora: str | None = Query(None, description="Nome da distribuidora"),
    estado: str | None = Query(None, description="UF"),
    limit: int = Query(100, ge=1, le=500)
):
    """
    @tool
    @name get_aneel_tariffs
    @description Obtém tarifas de energia elétrica da ANEEL para uma ou mais distribuidoras.
    @category energy_data
    @param {str} [distribuidora] - Nome da distribuidora a ser consultada.
    @param {str} [estado] - Sigla do estado (UF) para filtrar as distribuidoras.
    @returns {object} Um objeto contendo a lista de tarifas encontradas.
    """
    try:
        cache_key = f"aneel:tariffs:{distribuidora or 'all'}:{estado or 'all'}"
        
        cached = await request.app.state.redis.get(cache_key)
        if cached:
            logger.info(f"✅ ANEEL Cache HIT: {cache_key}")
            return json.loads(cached)
        
        result = await aneel_service.get_tariffs(distribuidora, estado, limit)
        
        response_data = {
            "tariffs": result,
            "total": len(result),
            "filters": {
                "distribuidora": distribuidora,
                "estado": estado
            }
        }
        
        await request.app.state.redis.setex(
            cache_key,
            settings.CACHE_TTL_ANEEL,
            json.dumps(response_data)
        )
        
        return response_data
        
    except Exception as e:
        logger.error(f"❌ ANEEL tariffs error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/distribuidoras",
    summary="Listar distribuidoras disponíveis"
)
async def list_distribuidoras(request: Request):
    """
    @tool
    @name list_aneel_distribuidoras
    @description Lista todas as distribuidoras de energia elétrica disponíveis na ANEEL.
    @category energy_data
    @returns {object} Um objeto contendo a lista de distribuidoras.
    """
    try:
        cache_key = "aneel:distribuidoras:all"

        cached = await request.app.state.redis.get(cache_key)
        if cached:
            return json.loads(cached)

        tariffs = await aneel_service.get_tariffs(limit=500)

        # Extrair distribuidoras únicas
        distribuidoras = list(set(
            t.get("distribuidora", "Unknown") for t in tariffs
        ))
        distribuidoras.sort()

        result = {
            "distribuidoras": distribuidoras,
            "total": len(distribuidoras)
        }

        await request.app.state.redis.setex(
            cache_key,
            86400,  # 1 day
            json.dumps(result)
        )

        return result

    except Exception as e:
        logger.error(f"❌ ANEEL list error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sync", summary="Sincronizar dados ANEEL (manual)")
@limiter.limit("5/hour")
async def sync_aneel_data(request: Request, background_tasks: BackgroundTasks):
    """
    Trigger manual synchronization of ANEEL tariff data to PostgreSQL

    **Rate limit**: 5 requests/hour (expensive operation)

    **Process**: Runs in background, returns immediately
    """
    try:
        from app.scheduler.aneel_sync import aneel_scheduler

        # Add sync task to background
        async def run_sync():
            async with AsyncSessionLocal() as session:
                stats = await aneel_scheduler.sync_aneel_data(session)
                logger.info(f"Manual sync completed: {stats}")

        background_tasks.add_task(run_sync)

        return {
            "message": "Sync started in background",
            "scheduler_status": aneel_scheduler.get_status(),
        }

    except Exception as e:
        logger.error(f"❌ Manual sync error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sync/status", summary="Status do scheduler de sincronização")
async def get_sync_status():
    """
    Get current status of ANEEL sync scheduler

    Returns:
        - is_running: Whether scheduler is active
        - last_sync: Timestamp of last successful sync
        - sync_interval_hours: Hours between syncs
        - next_sync: Estimated next sync time
    """
    try:
        from app.scheduler.aneel_sync import aneel_scheduler

        return aneel_scheduler.get_status()

    except Exception as e:
        logger.error(f"❌ Scheduler status error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

