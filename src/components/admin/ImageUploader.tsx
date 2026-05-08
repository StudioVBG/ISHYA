"use client";

import {
  useCallback,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import Image from "next/image";
import { Camera, ImagePlus, Loader2, Star, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  ADMIN_MEDIA_BUCKET,
  compressImage,
  convertHeicIfNeeded,
} from "@/lib/admin/image-upload";
import { cn } from "@/lib/utils";

export interface UploadedPhoto {
  id: string;
  url: string;
  storagePath: string | null;
  altText: string;
  isPrimary: boolean;
  sortOrder: number;
  persistedId?: string;
}

interface Props {
  productId: string | null;
  value: UploadedPhoto[];
  onChange: (photos: UploadedPhoto[]) => void;
  disabled?: boolean;
}

const BUCKET = ADMIN_MEDIA_BUCKET;
const MAX_FILES_AT_ONCE = 12;

function makeId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function makeStoragePath(productId: string | null, originalName: string) {
  const ext = "jpg";
  const folder = productId ?? "pending";
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  void originalName;
  return `${folder}/${random}.${ext}`;
}

export function ImageUploader({ productId, value, onChange, disabled }: Props) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null,
  );
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputId = useId();
  const cameraInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      if (files.length > MAX_FILES_AT_ONCE) {
        toast.error(`Maximum ${MAX_FILES_AT_ONCE} photos à la fois.`);
        return;
      }

      const supabase = createClient();
      setBusy(true);
      setProgress({ done: 0, total: files.length });

      const uploaded: UploadedPhoto[] = [];
      let successCount = 0;

      for (const [i, raw] of files.entries()) {
        try {
          const converted = await convertHeicIfNeeded(raw);
          const compressed = await compressImage(converted);
          const path = makeStoragePath(productId, compressed.name);

          const { error: uploadError } = await supabase.storage
            .from(BUCKET)
            .upload(path, compressed, {
              contentType: "image/jpeg",
              cacheControl: "31536000",
              upsert: false,
            });

          if (uploadError) {
            console.error("[ImageUploader] upload:", uploadError);
            toast.error(
              `Photo ${i + 1} : ${uploadError.message || "échec de l'envoi"}`,
            );
          } else {
            const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
            uploaded.push({
              id: makeId(),
              url: data.publicUrl,
              storagePath: path,
              altText: "",
              isPrimary: false,
              sortOrder: 0,
              persistedId: undefined,
            });
            successCount += 1;
          }
        } catch (err) {
          console.error("[ImageUploader] processing:", err);
          toast.error(`Photo ${i + 1} : erreur de traitement`);
        } finally {
          setProgress({ done: i + 1, total: files.length });
        }
      }

      if (uploaded.length > 0) {
        const merged = [...value, ...uploaded];
        const hasPrimary = merged.some((p) => p.isPrimary);
        if (!hasPrimary && merged.length > 0) {
          merged[0].isPrimary = true;
        }
        const reordered = merged.map((p, idx) => ({ ...p, sortOrder: idx }));
        onChange(reordered);
      }

      if (successCount > 0) {
        toast.success(
          successCount === files.length
            ? `${successCount} photo${successCount > 1 ? "s" : ""} ajoutée${successCount > 1 ? "s" : ""}`
            : `${successCount} sur ${files.length} photo${files.length > 1 ? "s" : ""} ajoutée${successCount > 1 ? "s" : ""}`,
        );
      }

      setBusy(false);
      setProgress(null);
    },
    [productId, value, onChange],
  );

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    void processFiles(files);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || busy) return;
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/") ||
      /\.(heic|heif)$/i.test(f.name),
    );
    void processFiles(files);
  };

  const handleSetPrimary = (id: string) => {
    onChange(value.map((p) => ({ ...p, isPrimary: p.id === id })));
  };

  const handleRemove = async (id: string) => {
    const target = value.find((p) => p.id === id);
    if (!target) return;
    if (!window.confirm("Retirer cette photo ?")) return;

    if (target.storagePath && !target.persistedId) {
      try {
        const supabase = createClient();
        await supabase.storage.from(BUCKET).remove([target.storagePath]);
      } catch (err) {
        console.warn("[ImageUploader] storage cleanup:", err);
      }
    }

    const remaining = value
      .filter((p) => p.id !== id)
      .map((p, idx) => ({ ...p, sortOrder: idx }));

    if (target.isPrimary && remaining.length > 0) {
      remaining[0].isPrimary = true;
    }
    onChange(remaining);
  };

  const handleMove = (id: string, direction: -1 | 1) => {
    const idx = value.findIndex((p) => p.id === id);
    if (idx === -1) return;
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= value.length) return;
    const next = [...value];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    onChange(next.map((p, i) => ({ ...p, sortOrder: i })));
  };

  const handleAltChange = (id: string, altText: string) => {
    onChange(value.map((p) => (p.id === id ? { ...p, altText } : p)));
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !busy) setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-xl p-6 text-center transition-colors",
          isDragOver
            ? "border-ember bg-ember/5"
            : "border-border bg-bone-soft/30",
          (disabled || busy) && "opacity-60 pointer-events-none",
        )}
      >
        <ImagePlus className="w-8 h-8 mx-auto text-steel mb-2" />
        <p className="text-sm font-medium text-foreground mb-1">
          Glisse tes photos ici
        </p>
        <p className="text-xs text-steel-soft mb-4">
          ou choisis-les depuis ton appareil — JPG, PNG, WebP ou photos iPhone
          (HEIC). Elles sont compressées automatiquement.
        </p>

        <input
          id={fileInputId}
          ref={fileInputRef}
          type="file"
          accept="image/*,.heic,.heif"
          multiple
          className="hidden"
          onChange={handleFileInputChange}
          disabled={disabled || busy}
        />
        <input
          id={cameraInputId}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileInputChange}
          disabled={disabled || busy}
        />

        <div className="flex flex-wrap gap-2 justify-center">
          <label
            htmlFor={fileInputId}
            className="inline-flex items-center gap-2 px-4 py-2 bg-ember text-white rounded-lg text-sm font-medium hover:bg-ember-deep transition-colors cursor-pointer"
          >
            <ImagePlus className="w-4 h-4" />
            Choisir des photos
          </label>
          <label
            htmlFor={cameraInputId}
            className="sm:hidden inline-flex items-center gap-2 px-4 py-2 border border-border bg-white text-foreground rounded-lg text-sm font-medium hover:bg-bone-soft transition-colors cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            Prendre une photo
          </label>
        </div>

        {busy && progress && (
          <div className="mt-4 inline-flex items-center gap-2 text-sm text-steel">
            <Loader2 className="w-4 h-4 animate-spin" />
            Envoi en cours… {progress.done}/{progress.total}
          </div>
        )}
      </div>

      {value.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-steel-soft">
              {value.length} photo{value.length > 1 ? "s" : ""} — la première
              est utilisée comme image principale.
            </p>
          </div>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {value.map((photo, idx) => (
              <li
                key={photo.id}
                className={cn(
                  "relative group border border-border rounded-xl overflow-hidden bg-white",
                  photo.isPrimary && "ring-2 ring-ember",
                )}
              >
                <div className="relative aspect-square bg-bone-soft">
                  <Image
                    src={photo.url}
                    alt={photo.altText || `Photo ${idx + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover"
                  />
                  {photo.isPrimary && (
                    <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-ember text-white text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">
                      <Star className="w-3 h-3 fill-current" />
                      Principale
                    </span>
                  )}
                </div>
                <div className="p-2 space-y-2">
                  <input
                    type="text"
                    value={photo.altText}
                    onChange={(e) => handleAltChange(photo.id, e.target.value)}
                    placeholder="Décris la photo (optionnel)"
                    className="w-full text-xs px-2 py-1 border border-border rounded focus:outline-none focus:ring-1 focus:ring-ember"
                  />
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleMove(photo.id, -1)}
                        disabled={idx === 0 || busy || disabled}
                        title="Monter"
                        className="p-1 rounded hover:bg-bone-soft disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(photo.id, 1)}
                        disabled={idx === value.length - 1 || busy || disabled}
                        title="Descendre"
                        className="p-1 rounded hover:bg-bone-soft disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex gap-1">
                      {!photo.isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(photo.id)}
                          disabled={busy || disabled}
                          title="Définir comme principale"
                          className="p-1 rounded hover:bg-bone-soft text-steel hover:text-ember disabled:opacity-30"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemove(photo.id)}
                        disabled={busy || disabled}
                        title="Retirer"
                        className="p-1 rounded hover:bg-destructive-soft text-steel hover:text-destructive disabled:opacity-30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
