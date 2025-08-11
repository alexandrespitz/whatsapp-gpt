import { createServerClient } from "@supabase/ssr";
import config from "../config";

export const createSupabaseServerClient = (cookies: any) =>
  createServerClient(config.supabaseUrl, config.supabaseAnonKey, {
    cookies
  });