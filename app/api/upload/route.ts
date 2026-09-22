import { NextResponse } from "next/server";
import { getSessionRole } from "@/lib/session";
import { uploadSuratFile } from "@/lib/storage";

export async function POST(request: Request) {
  const role = await getSessionRole();
  if (role !== "admin_tu") {
    return NextResponse.json({ error: "Hanya admin TU yang boleh mengunggah file" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
  }

  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Ukuran file maksimal 10MB" }, { status: 400 });
  }

  try {
    const { path, fileName } = await uploadSuratFile(file);
    return NextResponse.json({ path, fileName });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Gagal upload" }, { status: 500 });
  }
}
