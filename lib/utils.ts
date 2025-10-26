import plsIndex from '../public/pls-index.json';
import playersIndex from '../public/players-index.json';

const plsFiles = Array.isArray((plsIndex as { files?: string[] }).files) ? (plsIndex as { files?: string[] }).files : [];
const playerFiles = Array.isArray((playersIndex as { files?: string[] }).files) ? (playersIndex as { files?: string[] }).files : [];

function sanitizeForLookup(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}+/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function buildLookup(files: string[], prefix: string): Map<string, string> {
  const map = new Map<string, string>();
  
  // First pass: collect all files by sanitized name
  const filesByKey = new Map<string, string[]>();
  files.forEach((file) => {
    const base = file.replace(/\.[^.]+$/, '');
    const key = sanitizeForLookup(base);
    if (key) {
      if (!filesByKey.has(key)) {
        filesByKey.set(key, []);
      }
      filesByKey.get(key)!.push(file);
    }
  });
  
  // Second pass: prefer .webp over other formats
  filesByKey.forEach((files, key) => {
    // Sort by preference: webp first, then png, then others
    const sorted = files.sort((a, b) => {
      const extA = a.toLowerCase().split('.').pop() || '';
      const extB = b.toLowerCase().split('.').pop() || '';
      
      if (extA === 'webp' && extB !== 'webp') return -1;
      if (extA !== 'webp' && extB === 'webp') return 1;
      if (extA === 'png' && extB !== 'png' && extB !== 'webp') return -1;
      if (extA !== 'png' && extA !== 'webp' && extB === 'png') return 1;
      return 0;
    });
    
    const selected = sorted[0];
    map.set(key, `${prefix}${selected}`);
  });
  
  return map;
}

const PLAYER_IMAGE_LOOKUP = buildLookup(playerFiles, '/players/');
const PLS_IMAGE_LOOKUP = buildLookup(plsFiles, '/pls/');
const FILE_PATH_LOOKUP = new Map<string, string>();
playerFiles.forEach((file) => FILE_PATH_LOOKUP.set(file.toLowerCase(), `/players/${file}`));
plsFiles.forEach((file) => FILE_PATH_LOOKUP.set(file.toLowerCase(), `/pls/${file}`));

export function getLocalPlayerImage(idLike: string | number | undefined | null): string {
  const fallback = '/player.png';
  if (idLike === undefined || idLike === null) return fallback;
  const value = String(idLike).trim();
  if (!value) return fallback;
  const match = value.match(/(\d+)/);
  const id = match?.[1];
  if (!id) return fallback;
  // Priorizar .webp primero, luego otros formatos
  const candidates = [`${id}.webp`, `${id}.png`, `${id}.jpg`, `${id}.jpeg`];
  for (const candidate of candidates) {
    const found = FILE_PATH_LOOKUP.get(candidate.toLowerCase());
    if (found) return found;
  }
  return fallback;
}

export function getLocalPlayerImageByName(nameLike: string | undefined | null): string {
  const fallback = '/player.png';
  if (!nameLike || typeof nameLike !== 'string') return fallback;
  const raw = nameLike.trim();
  if (!raw) return fallback;

  if (raw.startsWith('/players/') || raw.startsWith('/pls/')) {
    return raw;
  }

  const lower = raw.toLowerCase();
  const direct = FILE_PATH_LOOKUP.get(lower);
  if (direct) {
    return direct;
  }

  const lastSegment = raw.split(/[\/]/).pop() || raw;
  const withoutExt = lastSegment.replace(/\.(png|jpg|jpeg|webp)$/i, '');
  const sanitized = sanitizeForLookup(withoutExt);
  
  if (sanitized) {
    // Buscar primero en PLS (prioridad para .webp)
    const plsMatch = PLS_IMAGE_LOOKUP.get(sanitized);
    if (plsMatch) {
      return plsMatch;
    }
    // Fallback a PLAYERS
    const playerMatch = PLAYER_IMAGE_LOOKUP.get(sanitized);
    if (playerMatch) {
      return playerMatch;
    }
  }

  return fallback;
}

export function normalizePlayerImageSources(
  source?: string | null,
  name?: string | null,
): { local: string; remote?: string; placeholder: string } {
  const local = getLocalPlayerImageByName(name || "");
  const placeholder = getLocalPlayerImageByName("");
  
  if (!source) {
    return { local, placeholder };
  }

  const raw = source.trim();
  if (!raw) {
    return { local, placeholder };
  }

  if (/^data:/iu.test(raw)) {
    return { local, remote: raw, placeholder };
  }

  const lower = raw.toLowerCase();
  const fileMatch = FILE_PATH_LOOKUP.get(lower);
  if (fileMatch) {
    return { local, remote: fileMatch, placeholder };
  }

  if (raw.startsWith("ipfs://") || raw.startsWith("ipfs/")) {
    return { local, remote: toGatewayUrl(raw), placeholder };
  }

  if (/^https?:\/\//iu.test(raw)) {
    return { local, remote: raw, placeholder };
  }

  if (raw.startsWith("//")) {
    return { local, remote: `https:${raw}`, placeholder };
  }

  if (raw.startsWith("/")) {
    return { local, remote: raw, placeholder };
  }

  if (/^(?:pls|players)\//iu.test(raw)) {
    return { local, remote: `/${raw}`, placeholder };
  }

  return { local, placeholder };
}

export function resolvePlayerImageSource(
  source?: string | null,
  fallbackName?: string | null,
): string {
  const { local, remote, placeholder } = normalizePlayerImageSources(source, fallbackName);
  return remote ?? local ?? placeholder;
}

// Debug helper: Find all players with similar names
export function findSimilarPlayerNames(searchName: string): string[] {
  const sanitized = sanitizeForLookup(searchName);
  const results: string[] = [];
  
  // Search in PLS lookup
  for (const [key, value] of PLS_IMAGE_LOOKUP.entries()) {
    if (key.includes(sanitized) || sanitized.includes(key)) {
      results.push(`PLS: ${key} -> ${value}`);
    }
  }
  
  // Search in PLAYER lookup
  for (const [key, value] of PLAYER_IMAGE_LOOKUP.entries()) {
    if (key.includes(sanitized) || sanitized.includes(key)) {
      results.push(`PLAYER: ${key} -> ${value}`);
    }
  }
  
  return results;
}

// Debug helper: Test if a name exists in the lookup
export function testPlayerNameLookup(name: string): { found: boolean; sanitized: string; matches: string[] } {
  const sanitized = sanitizeForLookup(name);
  const plsMatch = PLS_IMAGE_LOOKUP.get(sanitized);
  const playerMatch = PLAYER_IMAGE_LOOKUP.get(sanitized);
  
  return {
    found: !!(plsMatch || playerMatch),
    sanitized,
    matches: [
      plsMatch ? `PLS: ${plsMatch}` : null,
      playerMatch ? `PLAYER: ${playerMatch}` : null,
    ].filter(Boolean) as string[],
  };
}

