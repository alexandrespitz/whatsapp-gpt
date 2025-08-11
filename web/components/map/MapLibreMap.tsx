"use client";

import { useEffect, useRef } from "react";
import maplibregl, { Map, GeoJSONSource, NavigationControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type MapLibreMapProps = {
  features?: GeoJSON.FeatureCollection;
};

export function MapLibreMap({ features }: MapLibreMapProps) {
  const mapRef = useRef<Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Map style: MapTiler if API key, else OSM fallback.
    const style =
      process.env.NEXT_PUBLIC_MAPTILER_API_KEY && process.env.NEXT_PUBLIC_MAPTILER_API_KEY.length > 0
        ? `https://api.maptiler.com/maps/streets/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`
        : "https://demotiles.maplibre.org/style.json";

    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style,
      center: [-97.5, 39.8],
      zoom: 3,
      attributionControl: true
    });

    map.addControl(new NavigationControl(), "top-right");

    map.on("load", () => {
      map.resize();

      // Add GeoJSON source and layers
      map.addSource("entities", {
        type: "geojson",
        data: features || {
          type: "FeatureCollection",
          features: []
        }
      });

      // Points
      map.addLayer({
        id: "entity-points",
        type: "circle",
        source: "entities",
        filter: ["==", "$type", "Point"],
        paint: {
          "circle-radius": 8,
          "circle-color": "#4F46E5",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff"
        }
      });

      // Lines
      map.addLayer({
        id: "entity-lines",
        type: "line",
        source: "entities",
        filter: ["==", "$type", "LineString"],
        paint: {
          "line-width": 4,
          "line-color": "#0EA5E9"
        }
      });

      // Polygons
      map.addLayer({
        id: "entity-polygons",
        type: "fill",
        source: "entities",
        filter: ["==", "$type", "Polygon"],
        paint: {
          "fill-color": "#FACC15",
          "fill-opacity": 0.3
        }
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update features when props change
  useEffect(() => {
    if (!mapRef.current) return;
    const source = mapRef.current.getSource("entities") as GeoJSONSource;
    if (source && features) {
      source.setData(features);
    }
  }, [features]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}