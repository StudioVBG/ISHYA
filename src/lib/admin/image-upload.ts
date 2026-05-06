import { createClient } from "@/lib/supabase/client";

export const ADMIN_MEDIA_BUCKET = "products-media";
export const COMPRESSION_TARGET_MB = 1;
export const MAX_DIMENSION = 2000;
// Garde-fou côté navigateur : on rejette tout fichier > 20 Mo avant même
// d'essayer compression / HEIC. Évite de charger un PSD géant en mémoire.
export const MAX_FILE_SIZE_MB = 20;

export class FileTooLargeError extends Error {
  readonly sizeMb: number;
  constructor(sizeMb: number) {
    super(
      `Fichier trop volumineux (${sizeMb.toFixed(1)} Mo). Maximum ${MAX_FILE_SIZE_MB} Mo.`,
    );
    this.name = "FileTooLargeError";
    this.sizeMb = sizeMb;
  }
}

export async function convertHeicIfNeeded(file: File): Promise<File> {
  const isHeic =
    /\.heic$/i.test(file.name) ||
    /\.heif$/i.test(file.name) ||
    file.type === "image/heic" ||
    file.type === "image/heif";
  if (!isHeic) return file;

  const heic2any = (await import("heic2any")).default;
  const blob = (await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.92,
  })) as Blob;
  return new File([blob], file.name.replace(/\.(heic|heif)$/i, ".jpg"), {
    type: "image/jpeg",
  });
}

export async function compressImage(file: File): Promise<File> {
  const imageCompression = (await import("browser-image-compression")).default;
  const compressed = await imageCompression(file, {
    maxSizeMB: COMPRESSION_TARGET_MB,
    maxWidthOrHeight: MAX_DIMENSION,
    useWebWorker: true,
    fileType: "image/jpeg",
    initialQuality: 0.85,
  });
  if (compressed instanceof File) return compressed;
  return new File([compressed], file.name.replace(/\.[^.]+$/, ".jpg"), {
    type: "image/jpeg",
  });
}

function makeStoragePath(folder: string) {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const safeFolder = folder.replace(/^\/+|\/+$/g, "") || "misc";
  return `${safeFolder}/${random}.jpg`;
}

export interface CropTarget {
  width: number;
  height: number;
}

// Recadre + redimensionne en center-crop sur un canvas. Utile pour les images
// dont le ratio ET les dimensions doivent être garantis (og:image 1200×630).
async function cropToTarget(file: File, target: CropTarget): Promise<File> {
  const blobUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Image illisible"));
      el.src = blobUrl;
    });

    const sourceRatio = img.width / img.height;
    const targetRatio = target.width / target.height;

    let sx = 0;
    let sy = 0;
    let sw = img.width;
    let sh = img.height;
    if (sourceRatio > targetRatio) {
      // Image trop large → on rogne sur la largeur
      sw = img.height * targetRatio;
      sx = (img.width - sw) / 2;
    } else if (sourceRatio < targetRatio) {
      // Image trop haute → on rogne sur la hauteur
      sh = img.width / targetRatio;
      sy = (img.height - sh) / 2;
    }

    const canvas = document.createElement("canvas");
    canvas.width = target.width;
    canvas.height = target.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas indisponible");
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, target.width, target.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.9),
    );
    if (!blob) throw new Error("Encodage canvas échoué");
    return new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
      type: "image/jpeg",
    });
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

export interface UploadResult {
  url: string;
  storagePath: string;
  /** Taille finale en kilo-octets de ce qui a été uploadé. */
  sizeKb: number;
}

export interface UploadOptions {
  crop?: CropTarget;
}

export async function uploadAdminImage(
  file: File,
  folder: string,
  options: UploadOptions = {},
): Promise<UploadResult> {
  const fileSizeMb = file.size / (1024 * 1024);
  if (fileSizeMb > MAX_FILE_SIZE_MB) {
    throw new FileTooLargeError(fileSizeMb);
  }

  const supabase = createClient();
  const converted = await convertHeicIfNeeded(file);
  // Si un ratio strict est demandé, on crop d'abord en taille cible (le crop
  // produit déjà une image dimensionnée et compressée). Sinon compression
  // standard avec la limite MAX_DIMENSION.
  const finalFile = options.crop
    ? await cropToTarget(converted, options.crop)
    : await compressImage(converted);
  const path = makeStoragePath(folder);

  const { error } = await supabase.storage
    .from(ADMIN_MEDIA_BUCKET)
    .upload(path, finalFile, {
      contentType: "image/jpeg",
      cacheControl: "31536000",
      upsert: false,
    });

  if (error) {
    throw new Error(error.message || "Upload échoué");
  }

  const { data } = supabase.storage
    .from(ADMIN_MEDIA_BUCKET)
    .getPublicUrl(path);

  return {
    url: data.publicUrl,
    storagePath: path,
    sizeKb: Math.round(finalFile.size / 1024),
  };
}

export function isAdminMediaUrl(url: string): boolean {
  return url.includes(`/storage/v1/object/public/${ADMIN_MEDIA_BUCKET}/`);
}

export function extractStoragePath(url: string): string | null {
  const marker = `/storage/v1/object/public/${ADMIN_MEDIA_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

export async function deleteAdminImage(urlOrPath: string): Promise<void> {
  const supabase = createClient();
  const path = urlOrPath.startsWith("http")
    ? extractStoragePath(urlOrPath)
    : urlOrPath;
  if (!path) return;
  await supabase.storage.from(ADMIN_MEDIA_BUCKET).remove([path]);
}

/**
 * Variante côté serveur : prend un client Supabase déjà créé (ex.
 * createAdminClient pour respecter le service role) et supprime du Storage
 * uniquement les URLs qui appartiennent au bucket admin. Les URLs externes
 * ou null sont ignorées silencieusement. À appeler après suppression d'une
 * row pour éviter les fichiers orphelins.
 */
export async function cleanupManagedUrlsServer(
  storage: { from: (bucket: string) => { remove: (paths: string[]) => Promise<unknown> } },
  urls: Array<string | null | undefined>,
): Promise<void> {
  const paths = urls
    .filter((u): u is string => typeof u === "string" && u.length > 0)
    .map((u) => extractStoragePath(u))
    .filter((p): p is string => !!p);
  if (paths.length === 0) return;
  try {
    await storage.from(ADMIN_MEDIA_BUCKET).remove(paths);
  } catch (err) {
    // Pas de blocage : l'orphelin n'empêche pas la cohérence applicative.
    console.warn("[cleanupManagedUrlsServer]", err);
  }
}
