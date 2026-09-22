import { NextResponse } from "next/server";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const passcode: string | undefined = body?.passcode;

  if (!passcode) {
    return NextResponse.json({ error: "Passcode wajib diisi" }, { status: 400 });
  }

  let role: "admin_tu" | "kepala_sekolah" | null = null;
  if (passcode === process.env.TU_PASSCODE) {
    role = "admin_tu";
  } else if (passcode === process.env.KEPSEK_PASSCODE) {
    role = "kepala_sekolah";
  }

  if (!role) {
    return NextResponse.json({ error: "Passcode salah" }, { status: 401 });
  }

  const token = await createSessionToken(role);
  const response = NextResponse.json({ ok: true, role });
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
