import React, { useCallback, useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import * as turf from '@turf/turf';
import { EvidenceItem, ZoneConfig, MapMode } from '../../types';
import { createMarkerElement } from './MapMarker';

// Simplified world countries GeoJSON
const COUNTRIES_GEOJSON_URL = 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_0_countries.geojson';

interface WorldMapProps {
  items: EvidenceItem[];
  selectedItem: EvidenceItem | null;
  onItemSelect: (item: EvidenceItem) => void;
  zoneConfig: ZoneConfig;
  mapMode: MapMode;
  onLocationPicked: (lat: number, lng: number) => void;
  onZoneCenterSet: (lat: number, lng: number) => void;
  onCountrySelect: (countryName: string) => void;
  tempMarker?: { lat: number; lng: number } | null;
}

const WorldMap: React.FC<WorldMapProps> = ({
  items,
  selectedItem,
  onItemSelect,
  zoneConfig,
  mapMode,
  onLocationPicked,
  onZoneCenterSet,
  onCountrySelect,
  tempMarker
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: maplibregl.Marker }>({});
  const tempMarkerRef = useRef<maplibregl.Marker | null>(null);
  const hoveredCountryIdRef = useRef<string | number | null>(null);
  const selectedCountryIdRef = useRef<string | number | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Ensure the min zoom shows only one world while keeping horizontal wrap enabled.
  const computeMinZoom = useCallback(() => {
    const containerWidth = mapContainer.current?.clientWidth || 1280;
    const baseWorldSizePx = 512; // MapLibre world size at zoom 0
    const targetZoom = Math.log2((containerWidth * 1.1) / baseWorldSizePx);
    return Math.max(1.5, Math.min(targetZoom, 4.5));
  }, []);

  // Initialize Map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const MapConstructor = maplibregl.Map || (maplibregl as any).default?.Map;

    if (!MapConstructor) {
      console.error("MapLibre GL JS could not be initialized. Constructor missing.");
      return;
    }

    const initialZoom = computeMinZoom();

    try {
      map.current = new MapConstructor({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            'carto-dark': {
              type: 'raster',
              tiles: [
                "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
                "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
                "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
                "https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
              ],
              tileSize: 256,
              attribution: '&copy; CartoDB'
            }
          },
          layers: [
            {
              id: 'carto-dark-layer',
              type: 'raster',
              source: 'carto-dark',
              minzoom: 0,
              maxzoom: 22
            }
          ]
        },
        center: [0, 20],
        zoom: initialZoom,
        minZoom: initialZoom,
        maxZoom: 18,
        renderWorldCopies: true,
        attributionControl: false
      });

      const applyResponsiveMinZoom = () => {
        if (!map.current) return;
        const minZoom = computeMinZoom();
        map.current.setMinZoom(minZoom);
        if (map.current.getZoom() < minZoom) {
          map.current.setZoom(minZoom);
        }
      };

      const handleMapLoad = () => {
        if (!map.current) return;

        applyResponsiveMinZoom();
        map.current.on('resize', applyResponsiveMinZoom);

        map.current.addSource('countries', {
          type: 'geojson',
          data: COUNTRIES_GEOJSON_URL,
          generateId: true
        });

        map.current.addLayer({
          id: 'countries-fill',
          type: 'fill',
          source: 'countries',
          layout: {},
          paint: {
            'fill-color': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              '#00FFB3', // Hover color
              ['boolean', ['feature-state', 'selected'], false],
              '#00D4FF', // Selected color
              'transparent' // Default
            ],
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              0.1,
              ['boolean', ['feature-state', 'selected'], false],
              0.2,
              0
            ]
          }
        });

        map.current.addLayer({
          id: 'countries-line',
          type: 'line',
          source: 'countries',
          layout: {},
          paint: {
            'line-color': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              '#00FFB3',
              ['boolean', ['feature-state', 'selected'], false],
              '#00D4FF',
              '#333333' // Default borders
            ],
            'line-width': 1
          }
        });

        map.current.addSource('zone-radius', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        });

        map.current.addLayer({
          id: 'zone-radius-fill',
          type: 'fill',
          source: 'zone-radius',
          paint: {
            'fill-color': '#00D4FF',
            'fill-opacity': 0.1
          }
        });

        map.current.addLayer({
          id: 'zone-radius-line',
          type: 'line',
          source: 'zone-radius',
          paint: {
            'line-color': '#00D4FF',
            'line-width': 2,
            'line-dasharray': [2, 2]
          }
        });

        const handleCountryHover = (e: maplibregl.MapMouseEvent) => {
          if (!map.current || !e.features?.length) return;
          const id = e.features[0].id;
          if (hoveredCountryIdRef.current !== null) {
            map.current.setFeatureState(
              { source: 'countries', id: hoveredCountryIdRef.current },
              { hover: false }
            );
          }
          if (id !== undefined) {
            hoveredCountryIdRef.current = id as string | number;
            map.current.setFeatureState({ source: 'countries', id }, { hover: true });
            map.current.getCanvas().style.cursor = 'pointer';
          }
        };

        const handleCountryLeave = () => {
          if (!map.current) return;
          if (hoveredCountryIdRef.current !== null) {
            map.current.setFeatureState(
              { source: 'countries', id: hoveredCountryIdRef.current },
              { hover: false }
            );
            hoveredCountryIdRef.current = null;
          }
          map.current.getCanvas().style.cursor = '';
        };
        map.current.on('mousemove', 'countries-fill', handleCountryHover);
        map.current.on('mouseleave', 'countries-fill', handleCountryLeave);

        setMapLoaded(true);
      };

      const handleWrap = () => {
        if (!map.current) return;
        const center = map.current.getCenter();
        const wrapped = center.wrap();
        if (wrapped.lng !== center.lng) {
          map.current.setCenter(wrapped);
        }
      };

      map.current.on('load', handleMapLoad);
      map.current.on('moveend', handleWrap);

      return () => {
        if (map.current) {
          map.current.off('load', handleMapLoad);
          map.current.off('moveend', handleWrap);
          map.current.remove();
          map.current = null;
        }
      };
    } catch (err) {
      console.error("Error initializing MapLibre:", err);
    }
  }, [computeMinZoom]);

  // Handle Logic Changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Handle Map Clicks via event listener to access latest props
    const clickHandler = (e: maplibregl.MapMouseEvent) => {
      // Stop propagation if clicking on a marker (markers handle their own clicks)
      if ((e.originalEvent.target as HTMLElement).closest('.custom-neon-marker')) return;

      if (mapMode === 'PICK_LOCATION') {
        onLocationPicked(e.lngLat.lat, e.lngLat.lng);
        return;
      }

      if (zoneConfig.mode === 'COUNTRY') {
        // Query rendered features at click point
        const features = map.current?.queryRenderedFeatures(e.point, { layers: ['countries-fill'] });
        const feature = features && features[0];
        if (feature) {
          const id = feature.id;
          if (id !== undefined) {
            if (selectedCountryIdRef.current !== null && selectedCountryIdRef.current !== id) {
              map.current?.setFeatureState(
                { source: 'countries', id: selectedCountryIdRef.current },
                { selected: false }
              );
            }
            selectedCountryIdRef.current = id as string | number;
            map.current?.setFeatureState({ source: 'countries', id }, { selected: true });
          }
          const countryName = feature.properties?.name || feature.properties?.name_en || feature.properties?.NAME; // Adjust based on GeoJSON props
          if (countryName) {
            onCountrySelect(countryName);
          }
        }
      } else if (zoneConfig.mode === 'RADIUS') {
        onZoneCenterSet(e.lngLat.lat, e.lngLat.lng);
      }
    };

    map.current.on('click', clickHandler);
    return () => {
      map.current?.off('click', clickHandler);
    };
  }, [mapLoaded, mapMode, zoneConfig.mode, onLocationPicked, onCountrySelect, onZoneCenterSet]);

  // Clear selected country state when mode resets
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    if (zoneConfig.mode !== 'COUNTRY' || !zoneConfig.selectedCountry) {
      if (selectedCountryIdRef.current !== null) {
        map.current.setFeatureState(
          { source: 'countries', id: selectedCountryIdRef.current },
          { selected: false }
        );
        selectedCountryIdRef.current = null;
      }
    }
  }, [mapLoaded, zoneConfig.mode, zoneConfig.selectedCountry]);

  // Update Radius Visualization
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const source = map.current.getSource('zone-radius') as maplibregl.GeoJSONSource;

    if (zoneConfig.mode === 'RADIUS' && zoneConfig.center && zoneConfig.radiusKm) {
      const center = [zoneConfig.center.lng, zoneConfig.center.lat];
      const radius = zoneConfig.radiusKm;
      const options = { steps: 64, units: 'kilometers' as const };
      const circle = turf.circle(center, radius, options);
      if (source) source.setData(circle);
    } else if (source) {
      source.setData({ type: 'FeatureCollection', features: [] });
    }
  }, [mapLoaded, zoneConfig]);

  // Update Markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove old markers
    Object.keys(markersRef.current).forEach((id) => {
      if (!items.find(i => i.id === id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Add/Update markers
    items.forEach(item => {
      const isSelected = selectedItem?.id === item.id;

      if (markersRef.current[item.id]) {
        // Update existing marker to avoid flickering
        const marker = markersRef.current[item.id];

        // Update visual state directly on DOM
        const el = marker.getElement();
        const dot = el.querySelector('div'); // The inner dot
        if (dot) {
          const isVideo = item.type === 'VIDEO';
          const color = isVideo ? '#00FFB3' : '#00D4FF';
          const glowColor = isVideo ? 'rgba(0,255,179,0.6)' : 'rgba(0,212,255,0.6)';
          dot.style.width = isSelected ? '24px' : '16px';
          dot.style.height = isSelected ? '24px' : '16px';
          dot.style.boxShadow = `0 0 ${isSelected ? '20px' : '10px'} ${glowColor}`;
          dot.style.backgroundColor = color;
        }

        // Update position if changed
        marker.setLngLat([item.lng, item.lat]);

      } else {
        // New marker
        // Ensure Marker constructor is available
        const MarkerConstructor = maplibregl.Marker || (maplibregl as any).default?.Marker;
        if (MarkerConstructor) {
          const el = createMarkerElement(item.type, isSelected);
          el.onclick = (e) => {
            e.stopPropagation(); // Stop map click event
            onItemSelect(item);
          };
          const marker = new MarkerConstructor({ element: el })
            .setLngLat([item.lng, item.lat])
            .addTo(map.current!);
          markersRef.current[item.id] = marker;
        }
      }
    });
  }, [mapLoaded, items, selectedItem, onItemSelect]);

  // Update Temp Marker
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const MarkerConstructor = maplibregl.Marker || (maplibregl as any).default?.Marker;
    if (!MarkerConstructor) return;

    if (tempMarker) {
      if (!tempMarkerRef.current) {
        const el = createMarkerElement('IMAGE', true); // Reuse neon style
        tempMarkerRef.current = new MarkerConstructor({ element: el })
          .setLngLat([tempMarker.lng, tempMarker.lat])
          .addTo(map.current);
      } else {
        tempMarkerRef.current.setLngLat([tempMarker.lng, tempMarker.lat]);
      }
    } else if (tempMarkerRef.current) {
      tempMarkerRef.current.remove();
      tempMarkerRef.current = null;
    }
  }, [mapLoaded, tempMarker]);

  // Fly to selection
  useEffect(() => {
    if (map.current && selectedItem) {
      map.current.flyTo({
        center: [selectedItem.lng, selectedItem.lat],
        zoom: 6,
        essential: true
      });
    }
  }, [selectedItem]);

  return (
    <div ref={mapContainer} className="h-full w-full absolute inset-0 z-0 bg-[#0A0F14]" />
  );
};

export default WorldMap;
