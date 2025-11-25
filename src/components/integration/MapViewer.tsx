/** @format */

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { MapPin, Cube, Mountains, Eye, EyeSlash } from "@phosphor-icons/react";
import { toast } from "sonner";

interface MapViewerProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  pitch?: number;
  showTerrain?: boolean;
  showBuildings?: boolean;
  onLocationChange?: (lat: number, lon: number) => void;
  className?: string;
}

export function MapViewer({
  latitude,
  longitude,
  zoom = 18,
  pitch = 60,
  showTerrain = true,
  showBuildings = true,
  onLocationChange,
  className = "",
}: MapViewerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [currentPitch, setCurrentPitch] = useState(pitch);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [terrainEnabled, setTerrainEnabled] = useState(showTerrain);
  const [buildingsEnabled, setBuildingsEnabled] = useState(showBuildings);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initMap = async () => {
      try {
        const maplibregl = (window as any).maplibregl;

        if (!maplibregl) {
          toast.error("MapLibre GL não está disponível");
          return;
        }

        const map = new maplibregl.Map({
          container: mapContainerRef.current,
          style: `https://api.maptiler.com/maps/hybrid/style.json?key=${
            import.meta.env.VITE_MAPTILER_API_KEY || "demo"
          }`,
          center: [longitude, latitude],
          zoom: currentZoom,
          pitch: currentPitch,
          bearing: 0,
          antialias: true,
        });

        map.on("load", () => {
          if (terrainEnabled) {
            map.addSource("terrain", {
              type: "raster-dem",
              url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${
                import.meta.env.VITE_MAPTILER_API_KEY || "demo"
              }`,
              tileSize: 256,
            });

            map.setTerrain({
              source: "terrain",
              exaggeration: 1.5,
            });

            map.addLayer({
              id: "hillshade",
              type: "hillshade",
              source: "terrain",
              layout: { visibility: "visible" },
              paint: {
                "hillshade-exaggeration": 0.5,
              },
            });
          }

          new maplibregl.Marker({
            color: "#FFD60A",
            scale: 1.2,
          })
            .setLngLat([longitude, latitude])
            .addTo(map);

          setIsMapLoaded(true);
        });

        map.on("moveend", () => {
          const center = map.getCenter();
          onLocationChange?.(center.lat, center.lng);
        });

        mapRef.current = map;
      } catch (error) {
        console.error("Error initializing map:", error);
        toast.error("Falha ao carregar o mapa");
      }
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const handlePitchChange = (value: number[]) => {
    const newPitch = value[0];
    setCurrentPitch(newPitch);
    if (mapRef.current) {
      mapRef.current.setPitch(newPitch);
    }
  };

  const handleZoomChange = (value: number[]) => {
    const newZoom = value[0];
    setCurrentZoom(newZoom);
    if (mapRef.current) {
      mapRef.current.setZoom(newZoom);
    }
  };

  const toggleTerrain = () => {
    if (!mapRef.current) return;

    const newState = !terrainEnabled;
    setTerrainEnabled(newState);

    if (newState) {
      mapRef.current.setTerrain({ source: "terrain", exaggeration: 1.5 });
      mapRef.current.setLayoutProperty("hillshade", "visibility", "visible");
    } else {
      mapRef.current.setTerrain(null);
      mapRef.current.setLayoutProperty("hillshade", "visibility", "none");
    }
  };

  const reset3DView = () => {
    if (!mapRef.current) return;

    mapRef.current.flyTo({
      center: [longitude, latitude],
      zoom: zoom,
      pitch: pitch,
      bearing: 0,
      duration: 1500,
    });

    setCurrentPitch(pitch);
    setCurrentZoom(zoom);
  };

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      <div
        ref={mapContainerRef}
        className='w-full h-full min-h-[400px] rounded-lg'
        style={{ minHeight: "400px" }}
      />

      {isMapLoaded && (
        <div className='absolute top-4 right-4 flex flex-col gap-2'>
          <Button
            size='icon'
            variant='secondary'
            onClick={toggleTerrain}
            title={
              terrainEnabled ? "Desativar terreno 3D" : "Ativar terreno 3D"
            }
            aria-label={
              terrainEnabled ? "Desativar terreno 3D" : "Ativar terreno 3D"
            }
            className='shadow-lg backdrop-blur-sm bg-background/90'>
            {terrainEnabled ? (
              <Mountains size={20} weight='fill' />
            ) : (
              <Mountains size={20} />
            )}
          </Button>

          <Button
            size='icon'
            variant='secondary'
            onClick={reset3DView}
            title='Resetar visualização'
            aria-label='Resetar visualização'
            className='shadow-lg backdrop-blur-sm bg-background/90'>
            <Cube size={20} weight='bold' />
          </Button>
        </div>
      )}

      {isMapLoaded && (
        <div className='absolute bottom-4 left-4 right-4 p-4 bg-background/90 backdrop-blur-sm rounded-lg shadow-lg space-y-3'>
          <div className='space-y-1.5'>
            <div className='flex items-center justify-between'>
              <label className='text-xs font-medium'>
                Inclinação da Câmera
              </label>
              <span className='text-xs text-muted-foreground'>
                {currentPitch}°
              </span>
            </div>
            <Slider
              value={[currentPitch]}
              onValueChange={handlePitchChange}
              min={0}
              max={85}
              step={5}
              className='w-full'
            />
          </div>

          <div className='space-y-1.5'>
            <div className='flex items-center justify-between'>
              <label className='text-xs font-medium'>Zoom</label>
              <span className='text-xs text-muted-foreground'>
                {currentZoom.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[currentZoom]}
              onValueChange={handleZoomChange}
              min={10}
              max={22}
              step={0.5}
              className='w-full'
            />
          </div>
        </div>
      )}
    </Card>
  );
}
