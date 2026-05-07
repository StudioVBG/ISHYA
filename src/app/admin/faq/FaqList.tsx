"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  Search,
  Eye,
  EyeOff,
  Trash2,
  Pencil,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { AdminFaqArticle } from "@/lib/queries/admin";
import {
  deleteFaqArticle,
  reorderFaqArticles,
  toggleFaqActive,
} from "./actions";

interface FaqListProps {
  articles: AdminFaqArticle[];
}

export function FaqList({ articles }: FaqListProps) {
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // État local pour l'ordre — synchronisé avec les props du serveur.
  // Permet l'optimistic update sans flicker pendant le upsert.
  const [items, setItems] = useState(articles);
  useEffect(() => {
    setItems(articles);
  }, [articles]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const deletingArticle = items.find((a) => a.id === deletingId);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (a) =>
        a.question.toLowerCase().includes(q) ||
        a.answer.toLowerCase().includes(q) ||
        (a.category ?? "").toLowerCase().includes(q),
    );
  }, [items, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, AdminFaqArticle[]>();
    for (const a of filtered) {
      const key = a.category ?? "Sans catégorie";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const onToggle = (id: string, current: boolean) => {
    startTransition(async () => {
      const res = await toggleFaqActive(id, !current);
      if (res.ok) {
        toast.success(current ? "Question masquée" : "Question publiée");
      } else {
        toast.error(res.error ?? "Erreur");
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!deletingId) return;
    const id = deletingId;
    startTransition(async () => {
      const res = await deleteFaqArticle(id);
      setDeletingId(null);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success("Question supprimée");
    });
  };

  const handleDragEnd = (categoryItems: AdminFaqArticle[]) => (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || query.trim()) return;

    const oldIndex = categoryItems.findIndex((a) => a.id === active.id);
    const newIndex = categoryItems.findIndex((a) => a.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(categoryItems, oldIndex, newIndex);

    // Optimistic update : on met à jour l'ordre dans `items` en remplaçant
    // les articles de cette catégorie par la nouvelle séquence
    const reorderedIds = new Set(reordered.map((a) => a.id));
    setItems((prev) => {
      const others = prev.filter((a) => !reorderedIds.has(a.id));
      return [...others, ...reordered];
    });

    startTransition(async () => {
      const res = await reorderFaqArticles(reordered.map((a) => a.id));
      if (!res.ok) {
        toast.error(res.error ?? "Réordonnancement échoué");
        setItems(articles); // rollback
      }
    });
  };

  const isReorderDisabled = query.trim().length > 0;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-light" />
        <input
          type="search"
          placeholder="Rechercher une question…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20"
          aria-label="Rechercher une question"
        />
      </div>

      {isReorderDisabled && (
        <p className="text-xs text-muted-light">
          ℹ Le glisser-déposer est désactivé pendant la recherche.
        </p>
      )}

      {grouped.length === 0 ? (
        <div className="bg-white border border-border rounded-lg p-12 text-center">
          <p className="text-sm text-muted">
            {query
              ? "Aucune question ne correspond à votre recherche."
              : "Aucune question pour l'instant. Créez la première."}
          </p>
        </div>
      ) : (
        grouped.map(([category, categoryItems]) => (
          <div
            key={category}
            className="bg-white border border-border rounded-lg overflow-hidden"
          >
            <div className="px-4 py-2.5 bg-muted-soft/60 border-b border-border">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
                {category}{" "}
                <span className="text-muted-light">
                  ({categoryItems.length})
                </span>
              </h2>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd(categoryItems)}
            >
              <SortableContext
                items={categoryItems.map((a) => a.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="divide-y divide-border">
                  {categoryItems.map((a) => (
                    <SortableFaqRow
                      key={a.id}
                      article={a}
                      pending={pending}
                      reorderDisabled={isReorderDisabled}
                      onToggle={onToggle}
                      onDelete={(id) => setDeletingId(id)}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          </div>
        ))
      )}

      <ConfirmDialog
        open={deletingId !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null);
        }}
        title="Supprimer cette question ?"
        description={
          deletingArticle
            ? `« ${deletingArticle.question} » sera supprimée. Cette action est définitive.`
            : undefined
        }
        confirmLabel="Supprimer"
        tone="destructive"
        pending={pending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

function SortableFaqRow({
  article: a,
  pending,
  reorderDisabled,
  onToggle,
  onDelete,
}: {
  article: AdminFaqArticle;
  pending: boolean;
  reorderDisabled: boolean;
  onToggle: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: a.id, disabled: reorderDisabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "px-4 py-3 flex items-start justify-between gap-3 hover:bg-muted-soft/60 transition-shadow",
        isDragging && "shadow-lg bg-white relative z-10",
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        disabled={reorderDisabled}
        aria-label={`Réordonner ${a.question}`}
        className={cn(
          "shrink-0 p-1 -ml-1 rounded text-muted-light hover:text-foreground hover:bg-muted-soft transition-colors touch-none",
          reorderDisabled
            ? "opacity-30 cursor-not-allowed"
            : "cursor-grab active:cursor-grabbing",
        )}
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <Link href={`/admin/faq/${a.id}`} className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {a.question}
        </p>
        <p className="text-xs text-muted line-clamp-1 mt-0.5">{a.answer}</p>
      </Link>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onToggle(a.id, a.isActive)}
          disabled={pending}
          aria-label={a.isActive ? "Masquer la question" : "Publier la question"}
          className={
            a.isActive
              ? "p-1.5 rounded-md text-success hover:bg-success-soft"
              : "p-1.5 rounded-md text-muted-light hover:bg-muted-soft"
          }
          title={a.isActive ? "Publiée" : "Masquée"}
        >
          {a.isActive ? (
            <Eye className="w-4 h-4" />
          ) : (
            <EyeOff className="w-4 h-4" />
          )}
        </button>
        <Link
          href={`/admin/faq/${a.id}`}
          aria-label="Modifier la question"
          className="p-1.5 rounded-md text-muted hover:bg-muted-soft"
          title="Modifier"
        >
          <Pencil className="w-4 h-4" />
        </Link>
        <button
          onClick={() => onDelete(a.id)}
          disabled={pending}
          aria-label="Supprimer la question"
          className="p-1.5 rounded-md text-destructive hover:bg-destructive-soft"
          title="Supprimer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </li>
  );
}
