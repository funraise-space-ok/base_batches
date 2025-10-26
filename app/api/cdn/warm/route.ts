export const runtime = "edge";

type WarmRequest = {
  names?: string[]; // filenames with or without extension
  alsoPng?: boolean; // warm png too
  manifestUrl?: string; // optional URL to a JSON manifest {files: [...]}
};

function getBaseUrl(headers: Headers): string {
  // Prefer explicit env
  const envBase = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "";
  if (envBase) return envBase.replace(/\/$/, "");
  // Derive from request headers
  const proto = headers.get("x-forwarded-proto") || "https";
  const host = headers.get("x-forwarded-host") || headers.get("host") || "";
  return `${proto}://${host}`;
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function normalizeNames(names: string[] | undefined): string[] {
  if (!Array.isArray(names)) return [];
  return unique(
    names
      .map((n) => String(n).trim())
      .filter((n) => n.length > 0)
  );
}

export async function POST(req: Request) {
  try {
    // Simple auth via code
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code") || req.headers.get("x-warm-code") || "";
    const expected = process.env.WARM_CODE || process.env.WARM_SECRET || "";
    if (!expected || code !== expected) {
      return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as WarmRequest;
    const baseUrl = getBaseUrl(req.headers);

    // Resolve filenames (prefer explicit names, else try manifest JSON in public)
    let files: string[] = [];
    const inputNames = normalizeNames(body.names);
    if (inputNames.length > 0) {
      files = inputNames.map((n) => (/[.]/.test(n) ? n : `${n}.webp`));
    } else {
      const manifestUrl = body.manifestUrl || `${baseUrl}/pls-index.json`;
      const m = await fetch(manifestUrl, { cache: "no-store" }).then(async (r) => (r.ok ? r.json().catch(() => null) : null)).catch(() => null);
      if (!m || !Array.isArray(m.files)) {
        return new Response(JSON.stringify({ error: "missing names; provide names[] or ensure pls-index.json is available" }), { status: 400 });
      }
      files = m.files.filter((f: any) => typeof f === "string");
    }

    // Build URLs
    const urls: string[] = [];
    for (const f of files) {
      urls.push(`${baseUrl}/pls/${f}`);
      if (body.alsoPng && /\.webp$/i.test(f)) {
        urls.push(`${baseUrl}/pls/${f.replace(/\.webp$/i, ".png")}`);
      }
    }

    // Fire requests concurrently (bounded)
    const CONCURRENCY = 12;
    let i = 0;
    const results: { url: string; status: number }[] = [];
    async function worker() {
      while (i < urls.length) {
        const idx = i++;
        const url = urls[idx];
        try {
          const r = await fetch(url, { cache: "no-store" });
          // consume body to help CDN
          await r.arrayBuffer().catch(() => {});
          results.push({ url, status: r.status });
        } catch {
          results.push({ url, status: 0 });
        }
      }
    }
    const workers = Array.from({ length: Math.min(CONCURRENCY, urls.length || 1) }, () => worker());
    await Promise.all(workers);

    return new Response(
      JSON.stringify({ baseUrl, count: urls.length, ok: results.filter((r) => r.status && r.status < 400).length, results }, null, 2),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }), { status: 500 });
  }
}


