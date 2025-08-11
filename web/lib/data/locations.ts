import { supabase } from "../supabase/client";

export async function listLocationsByBbox(orgId: string, bbox: [number, number, number, number]) {
  // Calls RPC to filter by bbox
  const { data, error } = await supabase.rpc("locations_within_bbox", {
    p_org: orgId,
    p_minlon: bbox[0],
    p_minlat: bbox[1],
    p_maxlon: bbox[2],
    p_maxlat: bbox[3]
  });
  if (error) return [];
  return data;
}

export async function upsertLocation(entityId: string, geojson: any, properties: any) {
  // Calls RPC to upsert a location
  const { data, error } = await supabase.rpc("upsert_entity_location", {
    p_entity: entityId,
    p_geojson: geojson,
    p_properties: properties
  });
  if (error) throw error;
  return data;
}

export async function deleteLocation(id: string) {
  const { error } = await supabase.from("entity_locations").delete().eq("id", id);
  if (error) throw error;
}