import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";

export default async function Page() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (key) => cookieStore.get(key)?.value } }
  );

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/app");
  } else {
    redirect("/login");
  }
}