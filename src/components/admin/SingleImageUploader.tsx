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
import { Camera, ImagePlus, Loader2, Trash2, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import {
  deleteAdminImage,
  isAdminMediaUrl,
  uploadAdminImage,
  type CropTarget,
} from "@/lib/admin/image-upload";
import { cn } from "@/lib/utils";

interface Props {
  value: string | null;
  onChange: (url: string | null) => void;
  folder: string;
  aspect?: "square" | "16/10" | "16/9" | "2/1" | "1200/630";
  /**
   * Si défini, l'image sera recadrée en center-crop puis redimensionnée
   * exactement à cette taille avant l'upload. Utile pour les images dont les
   * dimensions ET le ratio doivent être garantis (og:image 1200×630).
   */
  cropTo?: CropTarget;
  disabled?: boolean;
  hint?: string;
}

const ASPECT_CLASS: Record<NonNullable<Props["aspect"]>, string> = {
  square: "aspect-square",
  "16/10": "aspect-[16/10]",
  "16/9": "aspect-video",
  "2/1": "aspect-[2/1]",
  "1200/630": "aspect-[1200/630]",
};

export function SingleImageUploader({
  value,
  onChange,
  folder,
  aspect = "16/10",
  cropTo,
  disabled,
  hint,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [lastSizeKb, setLastSizeKb] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputId = useId();
  const cameraInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectClass = ASPECT_CLASS[aspect];

  const processFile = useCallback(
    async (file: File) => {
      if (disabled || busy) return;
      setBusy(true);
      try {
        // Si on remplace une image qui appartient à notre bucket, cleanup après upload réussi
        const previous = value;
        const result = await uploadAdminImage(file, folder, { crop: cropTo });
        onChange(result.url);
        setLastSizeKb(result.sizeKb);
        if (previous && isAdminMediaUrl(previous)) {
          deleteAdminImage(previous).catch((err) => {
            console.warn("[SingleImageUploader] cleanup ancienne:", err);
          });
        }
        toast.success(`Image envoyée · ${result.sizeKb} ko`);
      } catch (err) {
        console.error("[SingleImageUploader] upload:", err);
        const message =
          err instanceof Error ? err.message : "Échec de l'envoi";
        toast.error(message);
      } finally {
        setBusy(false);
      }
    },
    [busy, cropTo, disabled, folder, onChange, value],
  );

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void processFile(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || busy) return;
    const file = Array.from(e.dataTransfer.files).find(
      (f) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name),
    );
    if (file) void processFile(file);
  };

  const handleRemove = async () => {
    if (!value) return;
    if (!window.confirm("Retirer cette image ?")) return;
    if (isAdminMediaUrl(value)) {
      try {
        await deleteAdminImage(value);
      } catch (err) {
        console.warn("[SingleImageUploader] delete storage:", err);
      }
    }
    onChange(null);
    setLastSizeKb(null);
  };

  if (value) {
    return (
      <div className="space-y-2">
        <div
          className={cn(
            "relative rounded-lg overflow-hidden bg-bone-soft border border-border",
            aspectClass,
          )}
        >
          <Image
            src={value}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 480px"
            className="object-cover"
            unoptimized
          />
          {busy && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            id={fileInputId}
            ref={fileInputRef}
            type="file"
            accept="image/*,.heic,.heif"
            className="hidden"
            onChange={handleFileInputChange}
            disabled={disabled || busy}
          />
          <label
            htmlFor={fileInputId}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 border border-border bg-white text-foreground rounded-lg text-xs font-medium hover:bg-bone-soft transition-colors cursor-pointer",
              (disabled || busy) && "opacity-50 pointer-events-none",
            )}
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Remplacer
          </label>
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled || busy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border bg-white text-destructive rounded-lg text-xs font-medium hover:bg-destructive-soft transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Retirer
          </button>
          {lastSizeKb !== null && (
            <span className="text-xs text-steel-soft ml-auto">
              {lastSizeKb} ko
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled && !busy) setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={cn(
        "border-2 border-dashed rounded-xl p-5 text-center transition-colors",
        aspectClass,
        "flex flex-col items-center justify-center",
        isDragOver
          ? "border-ember bg-ember/5"
          : "border-border bg-bone-soft/30",
        (disabled || busy) && "opacity-60 pointer-events-none",
      )}
    >
      <ImagePlus className="w-7 h-7 text-steel mb-2" />
      <p className="text-sm font-medium text-foreground mb-1">
        Glisse une image ici
      </p>
      <p className="text-xs text-steel-soft mb-3">
        {hint ?? "JPG, PNG, WebP ou HEIC iPhone — compression auto."}
      </p>

      <input
        id={fileInputId}
        ref={fileInputRef}
        type="file"
        accept="image/*,.heic,.heif"
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
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-ember text-white rounded-lg text-xs font-medium hover:bg-ember-deep transition-colors cursor-pointer"
        >
          <ImagePlus className="w-3.5 h-3.5" />
          Choisir une image
        </label>
        <label
          htmlFor={cameraInputId}
          className="sm:hidden inline-flex items-center gap-2 px-3 py-1.5 border border-border bg-white text-foreground rounded-lg text-xs font-medium hover:bg-bone-soft transition-colors cursor-pointer"
        >
          <Camera className="w-3.5 h-3.5" />
          Caméra
        </label>
      </div>

      {busy && (
        <div className="mt-3 inline-flex items-center gap-2 text-xs text-steel">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Envoi en cours…
        </div>
      )}
    </div>
  );
}
