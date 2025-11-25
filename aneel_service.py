"""
ANEEL Service - Dados de tarifas e distribuidoras de energia
"""
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential
from typing import Dict, Any, List
from pydantic import BaseModel, Field
from ..core.config import settings
import logging

logger = logging.getLogger(__name__)


class ANEELTariffRequest(BaseModel):
    """Request schema para tarifas ANEEL"""
    distribuidora: str | None = Field(default=None, description="Nome da distribuidora")
    estado: str | None = Field(default=None, description="UF")
    ano: int | None = Field(default=None, description="Ano da tarifa")


class ANEELService:
    """Service para interagir com ANEEL Open Data API"""
    
    def __init__(self):
        self.base_url = settings.ANEEL_BASE_URL
        self.timeout = settings.HTTP_TIMEOUT
    
    @retry(
        stop=stop_after_attempt(settings.RETRY_MAX_ATTEMPTS),
        wait=wait_exponential(
            multiplier=settings.RETRY_WAIT_EXPONENTIAL_MULTIPLIER,
            max=settings.RETRY_WAIT_EXPONENTIAL_MAX
        )
    )
    async def get_tariffs(
        self,
        distribuidora: str | None = None,
        estado: str | None = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Obtém tarifas das distribuidoras
        
        Args:
            distribuidora: Nome da distribuidora (opcional)
            estado: UF (opcional)
            limit: Limite de resultados
            
        Returns:
            Lista de tarifas
        """
        try:
            # ANEEL Open Data usa CKAN API
            url = f"{self.base_url}/datastore_search"
            
            # Resource ID para tarifas (exemplo - verificar na documentação ANEEL)
            resource_id = "b1bd71e6-4ebd-4379-8c91-e1a7e2b5b1f9"
            
            params = {
                "resource_id": resource_id,
                "limit": limit
            }
            
            # Filtros
            filters = {}
            if distribuidora:
                filters["distribuidora"] = distribuidora
            if estado:
                filters["uf"] = estado.upper()
            
            if filters:
                import json
                params["filters"] = json.dumps(filters)
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                logger.info(f"📡 ANEEL tariffs request: {distribuidora or 'all'}")
                response = await client.get(url, params=params)
                response.raise_for_status()
                
                data = response.json()
                records = data.get("result", {}).get("records", [])
                
                logger.info(f"✅ ANEEL found {len(records)} tariffs")
                return records
                
        except httpx.HTTPStatusError as e:
            logger.error(f"❌ ANEEL HTTP error: {e.response.status_code}")
            # Fallback para dados locais (CSV)
            return await self._get_local_tariffs(distribuidora, estado)
        except Exception as e:
            logger.error(f"❌ ANEEL error: {str(e)}")
            return await self._get_local_tariffs(distribuidora, estado)
    
    async def _get_local_tariffs(
        self,
        distribuidora: str | None = None,
        estado: str | None = None
    ) -> List[Dict[str, Any]]:
        """
        Fallback: carrega tarifas do CSV local
        
        Args:
            distribuidora: Nome da distribuidora
            estado: UF
            
        Returns:
            Lista de tarifas do CSV
        """
        try:
            import csv
            from pathlib import Path
            
            csv_path = Path(__file__).parent.parent.parent.parent / "data" / "distribuidoras" / "aneel_distribuidoras_360.csv"
            
            tariffs = []
            with open(csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    # Filtros
                    if distribuidora and distribuidora.lower() not in row.get('distribuidora', '').lower():
                        continue
                    if estado and estado.upper() != row.get('uf', '').upper():
                        continue
                    
                    tariffs.append(row)
            
            logger.info(f"✅ Local CSV: {len(tariffs)} tariffs")
            return tariffs
            
        except Exception as e:
            logger.error(f"❌ Local CSV error: {str(e)}")
            return []


# Singleton instance
aneel_service = ANEELService()

