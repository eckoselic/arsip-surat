import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "arsip-surat";

export async function uploadSuratFile(
  file: File
): Promise<{ path: string; fileName: string }> {
  const supabase = createAdminClient();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${Date.now()}-${safeName}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, arrayBuffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    throw new Error(`Gagal upload file: ${error.message}`);
  }

  return { path, fileName: file.name };
}

export async function getSignedFileUrl(
  path: string | null
): Promise<string | null> {
  if (!path) return null;
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60); // berlaku 1 jam

  if (error) return null;
  return data.signedUrl;
}

export async function deleteSuratFile(path: string | null): Promise<void> {
  if (!path) return;
  const supabase = createAdminClient();
  await supabase.storage.from(BUCKET).remove([path]);
}
