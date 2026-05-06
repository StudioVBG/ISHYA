import { createClient } from "@/lib/supabase/client";

export const ADMIN_MEDIA_BUCKET = "products-media";
export const COMPRESSION_TARGET_MB = 1;
export const MAX_DIMENSION = 2000;

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

export interface UploadResult {
  url: string;
  storagePath: string;
}

export async function uploadAdminImage(
  file: File,
  folder: string,
): Promise<UploadResult> {
  const supabase = createClient();
  const converted = await convertHeicIfNeeded(file);
  const compressed = await compressImage(converted);
  const path = makeStoragePath(folder);

  const { error } = await supabase.storage
    .from(ADMIN_MEDIA_BUCKET)
    .upload(path, compressed, {
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

  return { url: data.publicUrl, storagePath: path };
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
