import { redirect } from "next/navigation";
import { getSessionRole } from "@/lib/session";

export default async function HomePage() {
  const role = await getSessionRole();
  if (role === "admin_tu") redirect("/tu");
  if (role === "kepala_sekolah") redirect("/kepsek");
  redirect("/login");
}
