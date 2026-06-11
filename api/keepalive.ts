import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = process.env.VITE_SUPABASE_URL;
  const apikey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !apikey) {
    res.status(500).json({ ok: false, error: "missing Supabase env vars" });
    return;
  }

  // Real table query so Supabase counts it as database activity
  const response = await fetch(`${url}/rest/v1/profiles?select=id&limit=1`, {
    headers: { apikey, Authorization: `Bearer ${apikey}` },
  });

  res
    .status(response.ok ? 200 : 502)
    .json({ ok: response.ok, status: response.status });
}
