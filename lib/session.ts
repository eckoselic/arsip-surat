import { cookies } from "next/headers";
import { type Role, SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export async function getSessionRole(): Promise<Role | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}
