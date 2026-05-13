import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/`, {
    headers: {
      apikey: process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "",
    },
  });

  res.status(200).json({ ok: true, status: response.status });
}
