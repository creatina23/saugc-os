// MIME declarado nao substitui verificacao do conteudo nem limites do Storage.
export const MIME_MIDIAS: readonly string[] = [
  "image/png", "image/jpeg", "image/webp", "image/gif",
  "video/mp4", "video/quicktime", "video/webm",
];
export const MAX_MIDIA_BYTES = 50 * 1024 * 1024;

export function validarMidia(arquivo: { type: string; size: number }): string | null {
  if (!MIME_MIDIAS.includes(arquivo.type.toLowerCase())) {
    return "Formato não permitido. Use PNG, JPEG, WebP, GIF, MP4, MOV ou WebM.";
  }
  if (!Number.isSafeInteger(arquivo.size) || arquivo.size < 0 || arquivo.size > MAX_MIDIA_BYTES) {
    return "Tamanho inválido. O limite é 50 MiB por arquivo.";
  }
  return null;
}
