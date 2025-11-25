# Serverless API Architecture for Solar Data Integration

This document outlines the serverless API architecture for integrating PVGIS, NASA POWER, and ANEEL data into the current YSH application without impacting the existing lightweight architecture.

## Architecture Overview

The serverless API will be implemented using a micro-architecture pattern, where each service (PVGIS, NASA, ANEEL) runs as independent serverless functions. This approach maintains the lightweight nature of the existing application while adding sophisticated solar data integration capabilities.

## API Endpoints Design

### 1. PVGIS Integration API

#### `/api/pvgis/calculate`
- **Method**: POST
- **Purpose**: Calculate solar production for a given location and system configuration
- **Request Body**:
```json
{
  "lat": -23.5505,
  "lon": -46.6333,
  "peakpower": 5.0,
  "loss": 14,
  "angle": 30,
  "aspect": 0,
  "mountingplace": "free",
  "pvtechchoice": "crystSi"
}
```
- **Response**: PVGISResponse object with production data

#### `/api/pvgis/irradiation`
- **Method**: GET
- **Purpose**: Get simplified irradiation data
- **Query Params**: `lat`, `lon`
- **Response**: Irradiation data with caching

### 2. NASA POWER Integration API

#### `/api/nasa/climate`
- **Method**: POST
- **Purpose**: Get climate data for solar analysis
- **Request Body**:
```json
{
  "lat": -23.5505,
  "lon": -46.6333,
  "start_date": "20240101",
  "end_date": "20241231",
  "parameters": ["ALLSKY_SFC_SW_DWN", "T2M", "WS10M", "PRECTOTCORR", "RH2M"]
}
```
- **Response**: NASAResponse object with climate data

#### `/api/nasa/irradiation`
- **Method**: GET
- **Purpose**: Get simplified irradiation data
- **Query Params**: `lat`, `lon`
- **Response**: Irradiation data with caching

### 3. ANEEL Integration API

#### `/api/aneel/tariffs`
- **Method**: GET
- **Purpose**: Get energy tariffs for distributors
- **Query Params**: `distribuidora`, `estado`, `limit`
- **Response**: Tariff data with caching

#### `/api/aneel/distribuidoras`
- **Method**: GET
- **Purpose**: List available distributors
- **Response**: List of distributors

## Serverless Function Implementation

### File Structure
```
src/
├── lib/
│   ├── api/
│   │   ├── solar-api.ts
│   │   ├── pvgis-service.ts
│   │   ├── nasa-service.ts
│   │   └── aneel-service.ts
├── pages/
│   ├── api/
│   │   ├── pvgis/
│   │   │   ├── calculate.ts
│   │   │   └── irradiation.ts
│   │   ├── nasa/
│   │   │   ├── climate.ts
│   │   │   └── irradiation.ts
│   │   └── aneel/
│   │       ├── tariffs.ts
│   │       └── distribuidoras.ts
```

### Caching Strategy
- **Redis**: For frequently accessed data (implemented as serverless Redis or in-memory cache)
- **TTL**: 
  - PVGIS: 24 hours (seasonal data changes slowly)
  - NASA: 24 hours (climate data updates daily)
  - ANEEL: 7 days (tariffs change infrequently)

### Error Handling
- Fallback to previous cached data when external APIs are unavailable
- Retry mechanisms with exponential backoff
- Graceful degradation when optional data is unavailable

## Integration Strategy
- No changes to existing frontend components
- New services will be accessible through new API endpoints
- Existing mock data will be replaced with real data gradually
- Maintain backward compatibility

## Deployment Strategy
- Serverless functions deployed via Vercel/AWS Lambda
- Independent deployment of each service
- Environment-based configuration for API keys
- Monitoring and rate limiting for API consumption