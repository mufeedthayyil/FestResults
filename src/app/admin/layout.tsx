import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const client = await createClient();
  const { data: userData } = await client.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  return children;
}
