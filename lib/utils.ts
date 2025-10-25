export function getLocalPlayerImage(idLike: string | number | undefined | null): string {
  const fallback = '/pls/1.png';
  if (idLike === undefined || idLike === null) return fallback;
  const value = String(idLike);
  const match = value.match(/(\d+)/);
  const id = match?.[1];
  return id ? `/pls/${id}.png` : fallback;
}

export function getLocalPlayerImageByName(nameLike: string | undefined | null): string {
  const fallback = '/pls/1.png';
  if (!nameLike || typeof nameLike !== 'string') return fallback;
  // Si ya es una ruta local válida hacia /pls y parece un png, devolver tal cual
  const raw = nameLike.trim();
  if (raw.startsWith('/pls/')) {
    return raw;
  }

  // Extraer último segmento si viene con ruta, y quitar extensión
  const lastSegment = raw.split(/[\\/]/).pop() || raw;
  const withoutExt = lastSegment.replace(/\.(png|jpg|jpeg|webp)$/i, '');

  // Normalizar: quitar acentos, trim, colapsar espacios, underscores
  const trimmed = withoutExt.trim();
  if (!trimmed) return fallback;
  // Quitar acentos
  const withoutAccents = trimmed.normalize('NFD').replace(/\p{Diacritic}+/gu, '');
  // Reemplazar cualquier secuencia de espacios por '_'
  const underscored = withoutAccents.replace(/\s+/g, '_');
  // Remover caracteres no válidos para filename, permitir letras, números y '_'
  const safe = underscored.replace(/[^A-Za-z0-9_]/g, '');
  if (!safe) return fallback;
  return `/pls/${safe}.png`;
}


