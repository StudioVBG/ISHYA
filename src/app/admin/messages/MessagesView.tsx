"use client";

import { useMemo, useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Search,
  Trash2,
  Loader2,
  Inbox,
  CheckCircle2,
  Archive,
  Ban,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  deleteContactMessage,
  updateContactMessageStatus,
  type ContactMessageStatus,
} from "./actions";

export interface ContactMessageRow {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: ContactMessageStatus;
  ipAddress: string | null;
  createdAt: string | null;
}

const STATUS_LABELS: Record<ContactMessageStatus, string> = {
  new: "Nouveau",
  read: "Lu",
  answered: "Répondu",
  spam: "Spam",
  archived: "Archivé",
};

const STATUS_STYLE: Record<ContactMessageStatus, string> = {
  new: "bg-terracotta/10 text-terracotta border-terracotta/20",
  read: "bg-muted-soft text-foreground border-border",
  answered: "bg-success-soft text-success border-success/30",
  spam: "bg-destructive-soft text-destructive border-destructive/30",
  archived: "bg-muted-soft text-foreground border-border",
};

const FILTERS: Array<{ value: "all" | ContactMessageStatus; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { value: "all", label: "Tous", icon: Inbox },
  { value: "new", label: "Nouveaux", icon: Mail },
  { value: "answered", label: "Répondus", icon: CheckCircle2 },
  { value: "spam", label: "Spam", icon: Ban },
  { value: "archived", label: "Archivés", icon: Archive },
];

export function MessagesView({ messages }: { messages: ContactMessageRow[] }) {
  const [filter, setFilter] = useState<"all" | ContactMessageStatus>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ContactMessageRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const deletingMessage = messages.find((m) => m.id === deletingId);

  const counts = useMemo(() => {
    return {
      all: messages.length,
      new: messages.filter((m) => m.status === "new").length,
      answered: messages.filter((m) => m.status === "answered").length,
      spam: messages.filter((m) => m.status === "spam").length,
      archived: messages.filter((m) => m.status === "archived").length,
    };
  }, [messages]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return messages.filter((m) => {
      if (filter !== "all" && m.status !== filter) return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.subject ?? "").toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
      );
    });
  }, [messages, filter, search]);

  const handleStatus = (id: string, status: ContactMessageStatus) => {
    startTransition(async () => {
      const res = await updateContactMessageStatus(id, status);
      if (res.ok) {
        toast.success("Statut mis à jour");
        if (selected?.id === id) setSelected({ ...selected, status });
      } else {
        toast.error(res.error || "Erreur");
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!deletingId) return;
    const id = deletingId;
    startTransition(async () => {
      const res = await deleteContactMessage(id);
      setDeletingId(null);
      if (res.ok) {
        toast.success("Message supprimé");
        if (selected?.id === id) setSelected(null);
      } else {
        toast.error(res.error || "Erreur");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Messages de contact</h2>
          <p className="text-sm text-muted">
            Reçus via le formulaire <code className="text-xs bg-muted-soft px-1 py-0.5 rounded">/contact</code>
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher…"
            className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const Icon = f.icon;
          const active = filter === f.value;
          const count = counts[f.value as keyof typeof counts] ?? 0;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors",
                active
                  ? "bg-terracotta text-white border-terracotta"
                  : "bg-white text-foreground border-border hover:border-terracotta/40",
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {f.label}
              <span
                className={cn(
                  "ml-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold",
                  active ? "bg-white/20" : "bg-muted-soft text-muted",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="lg:col-span-2 space-y-2"
        >
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted">
              <Inbox className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Aucun message</p>
            </div>
          ) : (
            filtered.map((m) => {
              const isSelected = selected?.id === m.id;
              return (
                <motion.button
                  key={m.id}
                  variants={staggerItem}
                  onClick={() => {
                    setSelected(m);
                    if (m.status === "new") handleStatus(m.id, "read");
                  }}
                  className={cn(
                    "w-full text-left p-4 rounded-lg border transition-colors",
                    isSelected
                      ? "border-terracotta bg-terracotta/5"
                      : "border-border bg-white hover:border-terracotta/40",
                    m.status === "new" && "border-l-4 border-l-terracotta",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground truncate">
                          {m.name}
                        </span>
                        <span
                          className={cn(
                            "shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border",
                            STATUS_STYLE[m.status],
                          )}
                        >
                          {STATUS_LABELS[m.status]}
                        </span>
                      </div>
                      <p className="text-xs text-muted truncate">{m.email}</p>
                      {m.subject ? (
                        <p className="text-sm font-medium text-foreground mt-1 truncate">
                          {m.subject}
                        </p>
                      ) : null}
                      <p className="text-sm text-muted mt-1 line-clamp-2">
                        {m.message}
                      </p>
                    </div>
                    {m.createdAt ? (
                      <span className="shrink-0 text-xs text-muted">
                        {formatDate(m.createdAt)}
                      </span>
                    ) : null}
                  </div>
                </motion.button>
              );
            })
          )}
        </motion.div>

        <div className="lg:col-span-1">
          {selected ? (
            <div className="sticky top-4 bg-white border border-border rounded-lg p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-foreground">{selected.name}</h3>
                  <a
                    href={`mailto:${selected.email}?subject=Re: ${selected.subject ?? "Votre message"}`}
                    className="inline-flex items-center gap-1 text-xs text-terracotta hover:underline"
                  >
                    {selected.email}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border",
                    STATUS_STYLE[selected.status],
                  )}
                >
                  {STATUS_LABELS[selected.status]}
                </span>
              </div>

              {selected.subject ? (
                <div>
                  <p className="text-xs font-medium text-muted mb-1">Sujet</p>
                  <p className="text-sm text-foreground">{selected.subject}</p>
                </div>
              ) : null}

              <div>
                <p className="text-xs font-medium text-muted mb-1">Message</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {selected.message}
                </p>
              </div>

              {selected.createdAt ? (
                <p className="text-xs text-muted">
                  Reçu le {formatDate(selected.createdAt)}
                  {selected.ipAddress ? ` · ${selected.ipAddress}` : ""}
                </p>
              ) : null}

              <div className="border-t border-border pt-4">
                <p className="text-xs font-medium text-muted mb-2">Changer le statut</p>
                <div className="flex flex-wrap gap-1.5">
                  {(["read", "answered", "spam", "archived"] as ContactMessageStatus[]).map(
                    (s) => (
                      <button
                        key={s}
                        disabled={isPending || selected.status === s}
                        onClick={() => handleStatus(selected.id, s)}
                        className={cn(
                          "px-2.5 py-1 rounded text-xs font-medium border transition-colors",
                          selected.status === s
                            ? "bg-foreground text-white border-foreground"
                            : "bg-white text-foreground border-border hover:border-terracotta/40 disabled:opacity-50",
                        )}
                      >
                        {STATUS_LABELS[s]}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <button
                disabled={isPending}
                onClick={() => setDeletingId(selected.id)}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 border border-destructive/30 text-destructive bg-destructive-soft rounded-lg text-sm font-medium hover:bg-destructive/15 transition-colors disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Supprimer
              </button>
            </div>
          ) : (
            <div className="bg-white border border-dashed border-border rounded-lg p-8 text-center text-muted text-sm">
              Sélectionne un message pour voir le contenu.
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deletingId !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null);
        }}
        title="Supprimer définitivement ce message ?"
        description={
          deletingMessage
            ? `Le message de ${deletingMessage.email} sera supprimé. Cette action est définitive.`
            : undefined
        }
        confirmLabel="Supprimer"
        tone="destructive"
        pending={isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
