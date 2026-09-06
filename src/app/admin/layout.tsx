import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const client = await createClient();
  const { data: userData } = await client.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  const { data: profile } = await client
    .from("admin_profiles")
    .select("role")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (!profile || !["admin", "editor"].includes(profile.role)) {
    redirect("/login?error=not-authorized");
  }

  return children;
}
