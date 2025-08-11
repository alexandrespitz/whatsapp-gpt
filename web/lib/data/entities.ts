import { supabase } from "../supabase/client";

export async function listEntities() {
  const { data, error } = await supabase
    .from("entities")
    .select("id,name,status,type_id,type:entity_types(name)")
    .limit(100);
  if (error) return [];
  return (data ?? []).map((e: any) => ({
    id: e.id,
    name: e.name,
    status: e.status,
    type_id: e.type_id,
    type_name: e.type?.name || ""
  }));
}

export async function getEntity(id: string) {
  const { data, error } = await supabase
    .from("entities")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function createEntity(entity: any) {
  const { data, error } = await supabase.from("entities").insert([entity]).select();
  if (error) throw error;
  return data?.[0];
}

export async function updateEntity(id: string, updates: any) {
  const { data, error } = await supabase.from("entities").update(updates).eq("id", id).select();
  if (error) throw error;
  return data?.[0];
}

export async function deleteEntity(id: string) {
  const { error } = await supabase.from("entities").delete().eq("id", id);
  if (error) throw error;
}

export async function moveEntityToStage(entityId: string, stageId: string) {
  const { error } = await supabase
    .from("entities")
    .update({ stage_id: stageId })
    .eq("id", entityId);
  if (error) throw error;
}