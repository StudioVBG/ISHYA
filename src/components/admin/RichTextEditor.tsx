"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Youtube from "@tiptap/extension-youtube";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Youtube as YoutubeIcon,
  Undo,
  Redo,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { uploadAdminImage } from "@/lib/admin/image-upload";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  /** Dossier Supabase Storage pour les images uploadées (ex. "blog", "pages-cms") */
  imageFolder?: string;
  disabled?: boolean;
}

/**
 * Éditeur WYSIWYG (TipTap) pour le contenu du blog et des pages CMS.
 *
 * Sortie : HTML string compatible avec `renderCmsBody` (qui sanitize via
 * DOMPurify côté storefront, cf. PR #27). L'éditeur ne fait PAS de
 * sanitization côté écriture pour permettre à l'admin d'utiliser des
 * tags non-allowlistés au cas où — la sécurité est garantie au rendu.
 *
 * Conserve la rétro-compat : si l'admin colle du markdown léger
 * (`## Titre`, `- liste`), TipTap l'affiche tel quel ; le storefront
 * gère les 2 formats via `renderCmsBody`.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = "Commencez à écrire...",
  imageFolder = "blog",
  disabled = false,
}: RichTextEditorProps) {
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // h1 réservé au titre de la page côté storefront
        heading: {
          levels: [2, 3],
          HTMLAttributes: {
            class: "font-display text-foreground mt-6 mb-3",
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: "list-disc pl-6 my-3 space-y-1",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal pl-6 my-3 space-y-1",
          },
        },
        blockquote: {
          HTMLAttributes: {
            class:
              "border-l-4 border-terracotta/40 pl-4 italic text-muted my-4",
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class:
              "bg-muted-soft rounded-lg p-3 font-mono text-xs my-3 overflow-x-auto",
          },
        },
        code: {
          HTMLAttributes: {
            class:
              "bg-muted-soft rounded px-1.5 py-0.5 font-mono text-xs",
          },
        },
        paragraph: {
          HTMLAttributes: {
            class: "my-3 leading-relaxed",
          },
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          class: "text-terracotta underline hover:text-terracotta-dark",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto my-4",
        },
      }),
      Youtube.configure({
        // Privacy-friendly : pas de cookies tant que la vidéo n'est pas
        // lue. La sortie HTML restera sanitizée par DOMPurify côté
        // storefront avec l'allowlist iframe (YouTube uniquement).
        nocookie: true,
        controls: true,
        // Wrapper responsive (16/9) — l'admin n'a pas à se soucier
        // du ratio à l'insertion.
        HTMLAttributes: {
          class: "rounded-lg my-4 aspect-video w-full",
        },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    editable: !disabled,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          "max-w-none focus:outline-none px-4 py-3 min-h-[300px] text-foreground text-sm",
          "[&_h2]:text-xl [&_h2]:font-bold",
          "[&_h3]:text-lg [&_h3]:font-semibold",
          "[&_strong]:font-bold [&_em]:italic",
          disabled && "opacity-60 cursor-not-allowed",
        ),
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // TipTap émet `<p></p>` pour vide — on remonte une string vide pour
      // que le caller voie clairement « pas de contenu ».
      onChange(html === "<p></p>" ? "" : html);
    },
  });

  // Sync externe : si la prop `value` change (ex. reset form), on resyncronise
  // l'éditeur — mais seulement si la valeur est différente pour éviter de
  // perdre la position du curseur pendant la frappe.
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const incoming = value || "";
    if (current === incoming) return;
    if (current === "<p></p>" && !incoming) return;
    editor.commands.setContent(incoming, { emitUpdate: false });
  }, [editor, value]);

  if (!editor) {
    return (
      <div className="border border-border rounded-lg bg-muted-soft/40 p-4 text-sm text-muted-light">
        Chargement de l&apos;éditeur…
      </div>
    );
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt(
      "URL du lien (laisser vide pour retirer) :",
      previousUrl ?? "https://",
    );
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    if (!/^(https?|mailto|tel):|^\/|^#/.test(url)) {
      toast.error("URL invalide. Doit commencer par http(s):, mailto:, tel:, / ou #");
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const insertYoutube = () => {
    const url = window.prompt(
      "URL YouTube (lien complet ou youtu.be) :",
      "https://www.youtube.com/watch?v=",
    );
    if (!url || url.trim() === "") return;
    // L'extension TipTap accepte les formats `youtube.com/watch?v=`,
    // `youtu.be/<id>` et `youtube.com/embed/<id>`. On valide juste le host.
    if (!/^https:\/\/(?:www\.)?(?:youtube\.com|youtu\.be|youtube-nocookie\.com)\//i.test(url)) {
      toast.error("URL YouTube invalide. Collez un lien youtube.com ou youtu.be");
      return;
    }
    const ok = editor
      .chain()
      .focus()
      .setYoutubeVideo({ src: url, width: 640, height: 360 })
      .run();
    if (!ok) {
      toast.error("Impossible d'insérer cette vidéo");
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const result = await uploadAdminImage(file, imageFolder);
      editor.chain().focus().setImage({ src: result.url }).run();
      toast.success("Image insérée");
    } catch (err) {
      console.error("[RichTextEditor] upload", err);
      toast.error(err instanceof Error ? err.message : "Erreur upload");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-terracotta/20 focus-within:border-terracotta">
      <Toolbar
        editor={editor}
        disabled={disabled}
        uploadingImage={uploadingImage}
        onSetLink={setLink}
        onPickImage={() => fileInputRef.current?.click()}
        onInsertYoutube={insertYoutube}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleImageUpload(file);
        }}
      />
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarButton({
  icon: Icon,
  label,
  active,
  disabled,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "p-1.5 rounded text-sm transition-colors",
        active
          ? "bg-terracotta text-white"
          : "text-foreground hover:bg-muted-soft",
        disabled && "opacity-40 cursor-not-allowed",
      )}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

function Toolbar({
  editor,
  disabled,
  uploadingImage,
  onSetLink,
  onPickImage,
  onInsertYoutube,
}: {
  editor: Editor;
  disabled: boolean;
  uploadingImage: boolean;
  onSetLink: () => void;
  onPickImage: () => void;
  onInsertYoutube: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-border bg-muted-soft/30">
      <ToolbarButton
        icon={Bold}
        label="Gras"
        active={editor.isActive("bold")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <ToolbarButton
        icon={Italic}
        label="Italique"
        active={editor.isActive("italic")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />

      <div className="w-px h-5 bg-border mx-1" aria-hidden />

      <ToolbarButton
        icon={Heading2}
        label="Titre H2"
        active={editor.isActive("heading", { level: 2 })}
        disabled={disabled}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
      />
      <ToolbarButton
        icon={Heading3}
        label="Titre H3"
        active={editor.isActive("heading", { level: 3 })}
        disabled={disabled}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
      />

      <div className="w-px h-5 bg-border mx-1" aria-hidden />

      <ToolbarButton
        icon={List}
        label="Liste à puces"
        active={editor.isActive("bulletList")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <ToolbarButton
        icon={ListOrdered}
        label="Liste numérotée"
        active={editor.isActive("orderedList")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />
      <ToolbarButton
        icon={Quote}
        label="Citation"
        active={editor.isActive("blockquote")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      />
      <ToolbarButton
        icon={Code}
        label="Code"
        active={editor.isActive("codeBlock")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      />

      <div className="w-px h-5 bg-border mx-1" aria-hidden />

      <ToolbarButton
        icon={LinkIcon}
        label="Lien"
        active={editor.isActive("link")}
        disabled={disabled}
        onClick={onSetLink}
      />
      {editor.isActive("link") && (
        <ToolbarButton
          icon={Unlink}
          label="Retirer le lien"
          disabled={disabled}
          onClick={() =>
            editor.chain().focus().extendMarkRange("link").unsetLink().run()
          }
        />
      )}

      <button
        type="button"
        onClick={onPickImage}
        disabled={disabled || uploadingImage}
        aria-label="Insérer une image"
        title="Insérer une image"
        className={cn(
          "p-1.5 rounded text-sm transition-colors text-foreground hover:bg-muted-soft",
          (disabled || uploadingImage) && "opacity-40 cursor-not-allowed",
        )}
      >
        {uploadingImage ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ImageIcon className="w-4 h-4" />
        )}
      </button>

      <ToolbarButton
        icon={YoutubeIcon}
        label="Insérer une vidéo YouTube"
        disabled={disabled}
        onClick={onInsertYoutube}
      />

      <div className="w-px h-5 bg-border mx-1" aria-hidden />

      <ToolbarButton
        icon={Undo}
        label="Annuler"
        disabled={disabled || !editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}
      />
      <ToolbarButton
        icon={Redo}
        label="Rétablir"
        disabled={disabled || !editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}
      />
    </div>
  );
}
