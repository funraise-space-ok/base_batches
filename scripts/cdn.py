#!/usr/bin/env python3
"""
Imprime las URLs completas de todas las imágenes dentro de public/pls para que las pegues manualmente.

Uso básico:
  SITE_URL=https://front-sports-git-main-funraise-spaces-projects.vercel.app \
  python3 scripts/cdn.py

Opciones (opcionales):
  --base-url   URL base del sitio (si no usás SITE_URL)
  --dir        Ruta al directorio 'pls' (default: ui/apps/sports/public/pls relativo a este script)
"""

import os
import sys
import argparse
import pathlib


def main():
  parser = argparse.ArgumentParser(description="Listar URLs completas de /pls para precalentamiento manual")
  parser.add_argument("--base-url", dest="base_url", default=os.environ.get("SITE_URL") or os.environ.get("CDN_BASE_URL") or os.environ.get("BASE_URL"))
  parser.add_argument("--dir", dest="pls_dir", default=None, help="Ruta al directorio pls (por defecto: ui/apps/sports/public/pls)")
  args = parser.parse_args()

  if not args.base_url:
    print("ERROR: Falta --base-url o la variable de entorno SITE_URL/BASE_URL/CDN_BASE_URL", file=sys.stderr)
    sys.exit(1)

  base = args.base_url.rstrip('/')

  # Resolver ruta por defecto al directorio 'pls'
  if args.pls_dir:
    pls_path = pathlib.Path(args.pls_dir)
  else:
    script_dir = pathlib.Path(__file__).resolve().parent
    pls_path = (script_dir / '..' / 'public' / 'pls').resolve()

  if not pls_path.is_dir():
    print(f"ERROR: Directorio no encontrado: {pls_path}", file=sys.stderr)
    sys.exit(1)

  # Extensiones comunes de imágenes
  exts = {'.webp', '.png', '.jpg', '.jpeg'}

  files = [p.name for p in sorted(pls_path.iterdir()) if p.is_file() and p.suffix.lower() in exts and not p.name.startswith('.')]

  if not files:
    print(f"WARN: No se encontraron imágenes en {pls_path}", file=sys.stderr)

  for name in files:
    print(f"{base}/pls/{name}")


if __name__ == "__main__":
  main()

#!/usr/bin/env python3
# Prewarm CDN by requesting /pls images (WebP first, fallback PNG on 404)
#
# Usage examples:
#   SITE_URL=https://your-app.vercel.app python scripts/cdn.py
#   python scripts/cdn.py --base-url https://your-app.vercel.app --start 1 --end 82
#   python scripts/cdn.py --base-url https://your-app.vercel.app --concurrency 24 --also-png
#   # Warm by names (preferred when filenames are by player name):
#   SITE_URL=https://your-app.vercel.app CDN_NAMES="Renzo_Olivo,Jesus_Montenegro" python scripts/cdn.py
#   python scripts/cdn.py --base-url https://your-app.vercel.app --names Renzo_Olivo,Jesus_Montenegro

import os
import time
import argparse
from typing import Tuple, Optional, List
from concurrent.futures import ThreadPoolExecutor, as_completed

try:
  import requests  # type: ignore
except ImportError:
  raise SystemExit("requests no está instalado. Instala con: pip install requests")


def build_urls_for_path(base_url: str, path_part: str, also_png: bool, fallback: bool) -> Tuple[str, Optional[str]]:
  # If path_part already includes an extension, use it as-is and do not fallback
  if "." in path_part:
    return f"{base_url}/pls/{path_part}", None
  # Otherwise, assume name without extension: try .webp first, then png
  webp = f"{base_url}/pls/{path_part}.webp"
  if also_png:
    return webp, f"{base_url}/pls/{path_part}.png"
  if fallback:
    return webp, f"{base_url}/pls/{path_part}.png"
  return webp, None


def fetch(session: requests.Session, url: str, timeout: int) -> Tuple[int, int]:
  t0 = time.perf_counter()
  resp = session.get(url, timeout=timeout)
  _ = resp.content  # ensure body consumed
  ms = int((time.perf_counter() - t0) * 1000)
  return resp.status_code, ms


def warm_one(session: requests.Session, webp_url: str, png_url: Optional[str], do_fallback: bool, timeout: int) -> Tuple[str, int, int]:
  # returns (final_url, status, ms)
  try:
    status, ms = fetch(session, webp_url, timeout)
    if status == 403:
      time.sleep(0.5)
      status, ms = fetch(session, webp_url, timeout)
    if status == 404 and do_fallback and png_url:
      status, ms = fetch(session, png_url, timeout)
      return png_url, status, ms
    return webp_url, status, ms
  except Exception:
    if do_fallback and png_url:
      try:
        status, ms = fetch(session, png_url, timeout)
        return png_url, status, ms
      except Exception:
        return webp_url, 0, 0
    return webp_url, 0, 0


def main():
  ap = argparse.ArgumentParser()
  ap.add_argument("--base-url", default=os.environ.get("SITE_URL") or os.environ.get("CDN_BASE_URL") or os.environ.get("BASE_URL"), help="e.g. https://your-app.vercel.app (también SITE_URL/CFN_BASE_URL/BASE_URL por env)")
  ap.add_argument("--start", type=int, default=int(os.environ.get("CDN_START", "1")))
  ap.add_argument("--end", type=int, default=int(os.environ.get("CDN_END", "82")))
  ap.add_argument("--concurrency", type=int, default=int(os.environ.get("CDN_CONCURRENCY", "16")))
  ap.add_argument("--timeout", type=int, default=int(os.environ.get("CDN_TIMEOUT", "10")))
  ap.add_argument("--no-fallback", action="store_true", help="no probar PNG si WebP devuelve 404")
  ap.add_argument("--also-png", action="store_true", help="precalentar tanto WebP como PNG (más requests)")
  ap.add_argument("--names", type=str, default=os.environ.get("CDN_NAMES", ""), help="lista separada por comas de nombres de archivo (sin extensión), p.ej. Renzo_Olivo,Jesus_Montenegro")
  ap.add_argument("--scan-local", action="store_true", help="leer archivos desde ui/apps/sports/public/pls si no se pasan --names (usa nombre+extensión exactos)")
  args = ap.parse_args()

  if not args.base_url:
    raise SystemExit("Falta --base-url o la variable de entorno SITE_URL/BASE_URL/ CDN_BASE_URL")

  base_url = args.base_url.rstrip("/")
  fallback = not args.no_fallback

  names: List[str] = []
  if args.names:
    names = [n.strip() for n in args.names.split(',') if n.strip()]
  # Si no hay nombres y se solicitó scan local, leer del directorio public/pls
  items: List[str] = []
  if not names and args.scan_local:
    # Resolver ruta ui/apps/sports/public/pls desde la ubicación de este script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    pls_dir = os.path.normpath(os.path.join(script_dir, '..', 'public', 'pls'))
    if os.path.isdir(pls_dir):
      files = [f for f in os.listdir(pls_dir) if f.lower().endswith(('.webp', '.png'))]
      # Use exact filenames (including extension) to form URLs
      items = sorted(files)
  if not items:
    items = names if names else [str(i) for i in range(args.start, args.end + 1)]

  # Browser-like headers to avoid WAF/CDN blocks
  headers = {
    "User-Agent": os.environ.get("CDN_UA", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"),
    "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    "Accept-Language": os.environ.get("CDN_LANG", "es-AR,es;q=0.9,en;q=0.8"),
    "Referer": base_url + "/",
    "Cache-Control": "no-cache",
  }

  results: List[Tuple[str, str, int, int]] = []
  with requests.Session() as session:
    session.headers.update(headers)
    with ThreadPoolExecutor(max_workers=args.concurrency) as ex:
      futures = {}
      for part in items:
        webp_url, png_url = build_urls_for_path(base_url, part, args.also_png, fallback)
        fut = ex.submit(warm_one, session, webp_url, png_url, (fallback or args.also_png), args.timeout)
        futures[fut] = part
      for fut in as_completed(futures):
        part = futures[fut]
        url, status, ms = fut.result()
        results.append((part, url, status, ms))

  results.sort(key=lambda x: (str(x[0])))
  ok = sum(1 for *_rest, s, __ in [(a, b, c, d) for a, b, c, d in results] if s and 200 <= s < 400)
  fail = sum(1 for *_rest, s, __ in [(a, b, c, d) for a, b, c, d in results] if not s or s >= 400)
  total_ms = sum(ms for *_, ms in results if ms)
  for part, url, status, ms in results:
    print(f"{part:>10}  {status:>3}  {ms:>4} ms  {url}")
  avg = int(total_ms / max(1, ok)) if ok else 0
  print(f"\nDone: ok={ok}, fail={fail}, avg={avg} ms")


if __name__ == "__main__":
  main()


