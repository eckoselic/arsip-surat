import { createClient } from "@supabase/supabase-js";

// PENTING: file ini HANYA boleh diimport dari server (route handler / server component).
// service_role key melewati RLS sepenuhnya, jadi jangan pernah expose ke client/browser.
// Karena aplikasi ini pakai Pola B (passcode, bukan Supabase Auth), semua otorisasi
// dicek manual di tiap route handler lewat lib/auth.ts sebelum query dijalankan.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
