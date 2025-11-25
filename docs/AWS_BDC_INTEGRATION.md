# Integração AWS Brazil Data Cube (BDC)

Este documento descreve a integração do Yello Solar Hub com o AWS Brazil Data Cube para acesso a imagens de satélite Sentinel-2 e CBERS-4.

## Visão Geral

O Brazil Data Cube (BDC) é uma plataforma de dados abertos do INPE que fornece cubos de dados de observação da Terra prontos para análise. Os dados estão hospedados na AWS como Open Data e podem ser acessados sem custo.

### Recursos AWS Disponíveis

#### 1. Sentinel-2A/2B

- **Bucket S3**: `s3://bdc-sentinel-2`
- **Região**: `us-west-2`
- **ARN**: `arn:aws:s3:::bdc-sentinel-2`
- **Acesso**: Público (sem credenciais necessárias)
- **CLI**: `aws s3 ls --no-sign-request s3://bdc-sentinel-2/`

#### 2. CBERS-4

- **Bucket S3**: `s3://bdc-cbers`
- **Região**: `us-west-2`
- **ARN**: `arn:aws:s3:::bdc-cbers`
- **Acesso**: Público (sem credenciais necessárias)
- **CLI**: `aws s3 ls --no-sign-request s3://bdc-cbers/`

#### 3. SNS Topics para Notificações

- **Sentinel-2**: `arn:aws:sns:us-west-2:896627514407:bdc-sentinel-2-object_created`
- **CBERS-4**: `arn:aws:sns:us-west-2:896627514407:bdc-cbers-object_created`

## STAC API

O BDC fornece uma API STAC (SpatioTemporal Asset Catalog) para descoberta e acesso aos dados.

### Endpoint

```
https://brazildatacube.dpi.inpe.br/stac/
```

### Exemplo de Uso

```typescript
import { BrazilDataCubeSTAC } from "@/lib/bdc-stac"

const stac = new BrazilDataCubeSTAC()

// Buscar coleções disponíveis
const collections = await stac.getCollections()

// Buscar imagens Sentinel-2 para uma área
const bbox = [-46.6333, -23.5505, -46.6233, -23.5405]
const results = await stac.searchSentinel2(
  bbox,
  "2023-01-01/2023-12-31",
  20, // max cloud cover %
  10  // limit
)

// Buscar imagens CBERS-4
const cbersResults = await stac.searchCBERS4(
  bbox,
  "2023-01-01/2023-12-31",
  20,
  10
)
```

## Coleções Disponíveis

### Sentinel-2

- **S2-16D-2**: Composições de 16 dias (média)
- **S2_L2A-1**: Imagens Level 2A individuais (corrigidas atmosfericamente)

### CBERS-4

- **CBERS-4-MUX-2M**: Câmera MUX com resolução de 2 meses
- **CBERS-4-AWFI-16D-2**: Câmera AWFI com composições de 16 dias

## Integração no MapLibre GL

### Adicionando Camadas de Satélite

```typescript
// Adicionar source para Sentinel-2
map.current.addSource("sentinel-bdc", {
  type: "raster",
  tiles: [
    "https://brazildatacube.dpi.inpe.br/api/tiles/{z}/{x}/{y}?collection=S2_L2A-1&bands=red,green,blue"
  ],
  tileSize: 256,
  minzoom: 8,
  maxzoom: 18
})

// Adicionar layer
map.current.addLayer({
  id: "sentinel-layer",
  type: "raster",
  source: "sentinel-bdc",
  paint: {
    "raster-opacity": 0.9
  }
})
```

## Componentes Implementados

### `BrazilDataCubeSTAC` Class

Classe utilitária em `src/lib/bdc-stac.ts` que fornece métodos para:

- Listar coleções disponíveis
- Buscar imagens por área e data
- Filtrar por cobertura de nuvens
- Construir URLs de tiles
- Extrair assets de imagens true-color

### `ShadingAnalysis3D` Component

Componente em `src/components/solar/ShadingAnalysis3D.tsx` que:

- Exibe mapa 3D com opções de visualização
- Alterna entre camadas Sentinel-2, CBERS-4 e satélite padrão
- Lista imagens disponíveis para a localização
- Mostra metadados (data, cobertura de nuvens, plataforma)

## Fluxo de Trabalho

1. **Inicialização**: Usuário fornece endereço ou CEP
2. **Busca de Imagens**: Sistema consulta STAC API para imagens disponíveis
3. **Seleção de Camada**: Usuário escolhe entre Sentinel-2, CBERS-4 ou padrão
4. **Renderização**: MapLibre carrega e exibe a camada selecionada
5. **Análise**: Sistema pode usar as imagens para análise de sombreamento

## Limitações e Considerações

### Performance

- As requisições STAC podem levar alguns segundos
- Tiles são carregados sob demanda pelo MapLibre
- Cache local pode ser implementado para melhorar performance

### Cobertura de Dados

- Sentinel-2: Revisita de 5 dias (ambos satélites)
- CBERS-4: Revisita de 26 dias
- Nem todas as áreas têm imagens recentes com baixa cobertura de nuvens

### Resolução Espacial

- **Sentinel-2**: 10m (bandas visíveis), 20m (bandas NIR), 60m (bandas atmosféricas)
- **CBERS-4 MUX**: 20m
- **CBERS-4 AWFI**: 64m

## Próximos Passos

### Implementações Futuras

1. **Análise Temporal**: Visualizar mudanças ao longo do tempo
2. **Índices de Vegetação**: NDVI, EVI para análise de cobertura vegetal
3. **Análise de Sombras**: Usar imagens multitemporais para detectar padrões de sombreamento
4. **Download de Assets**: Permitir download de GeoTIFF para análise offline
5. **Notificações**: Integrar SNS topics para alertas de novas imagens
6. **Machine Learning**: Usar imagens para treinar modelos de detecção de painéis solares

### Melhorias de UX

1. **Seletor de Data**: Permitir usuário escolher data específica
2. **Comparação Lado-a-Lado**: Comparar diferentes datas/satélites
3. **Preview de Thumbnails**: Mostrar miniaturas das imagens antes de carregar
4. **Filtros Avançados**: Filtrar por ângulo solar, qualidade de imagem, etc.

## Recursos Adicionais

- [Brazil Data Cube Documentation](https://brazil-data-cube.github.io/)
- [STAC Specification](https://stacspec.org/)
- [AWS Open Data Registry - BDC](https://registry.opendata.aws/bdc/)
- [Sentinel-2 User Guide](https://sentinel.esa.int/web/sentinel/user-guides/sentinel-2-msi)
- [CBERS-4 Information](http://www.cbers.inpe.br/)

## Contato e Suporte

Para questões técnicas sobre o Brazil Data Cube:
- Email: brazildatacube@inpe.br
- GitHub: https://github.com/brazil-data-cube

Para questões sobre AWS Open Data:
- AWS Open Data: https://aws.amazon.com/opendata/
