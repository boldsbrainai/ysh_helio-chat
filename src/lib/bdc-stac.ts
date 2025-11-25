export interface STACCollection {
  id: string
  title: string
  description: string
  extent: {
    spatial: {
      bbox: number[][]
    }
    temporal: {
      interval: string[][]
    }
  }
}

export interface STACItem {
  id: string
  type: "Feature"
  geometry: {
    type: "Polygon"
    coordinates: number[][][]
  }
  properties: {
    datetime: string
    "eo:cloud_cover"?: number
    platform?: string
    instruments?: string[]
  }
  assets: {
    [key: string]: {
      href: string
      type: string
      title?: string
      roles?: string[]
    }
  }
}

export interface STACSearchParams {
  bbox?: number[]
  datetime?: string
  collections?: string[]
  limit?: number
  "eo:cloud_cover"?: {
    lte?: number
  }
}

export interface STACSearchResponse {
  type: "FeatureCollection"
  features: STACItem[]
  links: Array<{
    rel: string
    href: string
  }>
  context?: {
    page: number
    limit: number
    matched: number
    returned: number
  }
  links: Array<{
    rel: string
    href: string
  }>
}

const BDC_STAC_ENDPOINT = "https://brazildatacube.dpi.inpe.br/stac/"

export class BrazilDataCubeSTAC {
  private endpoint: string

  constructor(endpoint: string = BDC_STAC_ENDPOINT) {
    this.endpoint = endpoint
  }

  async getCollections(): Promise<{ collections: STACCollection[] }> {
    const response = await fetch(`${this.endpoint}collections`)
    if (!response.ok) {
      throw new Error(`Failed to fetch collections: ${response.statusText}`)
    }
    return response.json()
  }

  async getCollection(collectionId: string): Promise<STACCollection> {
    const response = await fetch(`${this.endpoint}collections/${collectionId}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch collection ${collectionId}: ${response.statusText}`)
    }
    return response.json()
  }

  async search(params: STACSearchParams): Promise<STACSearchResponse> {
    const response = await fetch(`${this.endpoint}search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      throw new Error(`STAC search failed: ${response.statusText}`)
    }

    return response.json()
  }

  async searchSentinel2(
    bbox: number[],
    dateRange: string = "2023-01-01/2023-12-31",
    maxCloudCover: number = 20,
    limit: number = 10
  ): Promise<STACSearchResponse> {
    return this.search({
      bbox,
      datetime: dateRange,
      collections: ["S2-16D-2", "S2_L2A-1"],
      limit,
      "eo:cloud_cover": {
        lte: maxCloudCover,
      },
    })
  }

  async searchCBERS4(
    bbox: number[],
    dateRange: string = "2023-01-01/2023-12-31",
    maxCloudCover: number = 20,
    limit: number = 10
  ): Promise<STACSearchResponse> {
    return this.search({
      bbox,
      datetime: dateRange,
      collections: ["CBERS-4-MUX-2M", "CBERS-4-AWFI-16D-2"],
      limit,
      "eo:cloud_cover": {
        lte: maxCloudCover,
      },
    })
  }

  buildCOGTileURL(asset: STACItem["assets"][string], z: number, x: number, y: number): string {
    const baseUrl = asset.href.replace("s3://", "https://s3.amazonaws.com/")
    return `${baseUrl}?z=${z}&x=${x}&y=${y}`
  }

  getTrueColorAsset(item: STACItem): string | null {
    const trueColorKeys = ["visual", "true_color", "thumbnail", "red", "green", "blue"]
    
    for (const key of trueColorKeys) {
      if (item.assets[key]) {
        return item.assets[key].href
      }
    }

    return null
  }
}

export interface TileLayerConfig {
  id: string
  name: string
  description: string
  source: "sentinel-2" | "cbers-4"
  collection: string
  tiles: string[]
  tileSize: number
  minzoom?: number
  maxzoom?: number
  bounds?: number[]
}

export async function getBDCTileLayer(
  source: "sentinel-2" | "cbers-4",
  bbox: number[],
  dateRange?: string
): Promise<TileLayerConfig | null> {
  const stac = new BrazilDataCubeSTAC()

  try {
    let searchResult: STACSearchResponse

    if (source === "sentinel-2") {
      searchResult = await stac.searchSentinel2(bbox, dateRange, 15, 1)
    } else {
      searchResult = await stac.searchCBERS4(bbox, dateRange, 15, 1)
    }

    if (searchResult.features.length === 0) {
      console.warn(`No ${source} imagery found for the given area and date range`)
      return null
    }

    const item = searchResult.features[0]
    const assetUrl = stac.getTrueColorAsset(item)

    if (!assetUrl) {
      console.warn(`No true color asset found for ${source} item`)
      return null
    }

    const s3Url = assetUrl.replace("s3://bdc-", "https://bdc-")
      .replace("s3://", "https://s3.amazonaws.com/")

    const config: TileLayerConfig = {
      id: `bdc-${source}-${item.id}`,
      name: source === "sentinel-2" ? "Sentinel-2 (BDC)" : "CBERS-4 (BDC)",
      description: `Imagem de ${new Date(item.properties.datetime).toLocaleDateString("pt-BR")} - Cobertura de nuvens: ${item.properties["eo:cloud_cover"]?.toFixed(1) || "N/A"}%`,
      source,
      collection: item.id.split("_")[0],
      tiles: [s3Url],
      tileSize: 256,
      minzoom: 8,
      maxzoom: 18,
      bounds: bbox,
    }

    return config
  } catch (error) {
    console.error(`Error fetching ${source} tile layer from BDC:`, error)
    return null
  }
}

export async function getAvailableImagery(
  lat: number,
  lon: number,
  bufferDegrees: number = 0.05
): Promise<{
  sentinel2: STACItem[]
  cbers4: STACItem[]
}> {
  const bbox = [
    lon - bufferDegrees,
    lat - bufferDegrees,
    lon + bufferDegrees,
    lat + bufferDegrees,
  ]

  const stac = new BrazilDataCubeSTAC()

  try {
    const [sentinel2Result, cbers4Result] = await Promise.all([
      stac.searchSentinel2(bbox, "2023-01-01/2024-12-31", 30, 20),
      stac.searchCBERS4(bbox, "2023-01-01/2024-12-31", 30, 20),
    ])

    return {
      sentinel2: sentinel2Result.features.sort(
        (a, b) => new Date(b.properties.datetime).getTime() - new Date(a.properties.datetime).getTime()
      ),
      cbers4: cbers4Result.features.sort(
        (a, b) => new Date(b.properties.datetime).getTime() - new Date(a.properties.datetime).getTime()
      ),
    }
  } catch (error) {
    console.error("Error fetching available imagery:", error)
    return { sentinel2: [], cbers4: [] }
  }
}
