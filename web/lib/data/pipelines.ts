import { supabase } from "../supabase/client";

export async function useStageColumns() {
  const { data, error } = await supabase.from("pipeline_stages").select("id,name,position").order("position");
  if (error) return [];
  return data ?? [];
}