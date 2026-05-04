"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import type { AdminTeamMember } from "@/lib/queries/admin";
import { toggleMemberActive, updateMemberRole } from "./actions";

const ROLE_LABELS: Record<string, { label: string; className: string }> = {
  super_admin: {
    label: "Super-admin",
    className: "bg-destructive-soft text-destructive",
  },
  admin: {
    label: "Admin",
    className: "bg-accent-purple-soft text-accent-purple",
  },
  editor: {
    label: "Éditeur",
    className: "bg-info-soft text-info",
  },
  support: {
    label: "Support",
    className: "bg-info-soft text-info",
  },
  customer: {
    label: "Client (rétrogradé)",
    className: "bg-muted-soft text-muted",
  },
};

const ROLE_OPTIONS = ["super_admin", "admin", "editor", "support", "customer"];

export function EquipeView({
  members,
  currentUserId,
  isSuperAdmin,
}: {
  members: AdminTeamMember[];
  currentUserId: string;
  isSuperAdmin: boolean;
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRoleChange = (userId: string, role: string) => {
    setPendingId(userId);
    startTransition(async () => {
      const res = await updateMemberRole(userId, role);
      setPendingId(null);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success("Rôle mis à jour");
    });
  };

  const handleToggleActive = (userId: string, current: boolean) => {
    setPendingId(userId);
    startTransition(async () => {
      const res = await toggleMemberActive(userId, !current);
      setPendingId(null);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success(current ? "Compte désactivé" : "Compte activé");
    });
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={staggerItem}>
        <h2 className="text-xl font-bold text-foreground">Équipe</h2>
        <p className="text-sm text-muted">
          {members.length} membre{members.length > 1 ? "s" : ""}
          {!isSuperAdmin && (
            <span className="ml-2 inline-flex items-center gap-1 text-xs text-warning">
              <ShieldAlert className="w-3.5 h-3.5" />
              Lecture seule (super-admin requis pour éditer)
            </span>
          )}
        </p>
      </motion.div>

      {!isSuperAdmin && (
        <motion.div
          variants={staggerItem}
          className="bg-warning-soft border border-warning/20 rounded-xl p-4 text-sm text-warning"
        >
          Seul un super-admin peut promouvoir, rétrograder ou désactiver un
          membre. Les actions ci-dessous sont désactivées.
        </motion.div>
      )}

      <motion.div
        variants={staggerItem}
        className="bg-white rounded-xl border border-border overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted-soft/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                  Membre
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                  Inscription
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                  Dernière connexion
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-4 py-3 w-32"></th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-muted-light"
                  >
                    Aucun membre d&apos;équipe pour l&apos;instant.
                  </td>
                </tr>
              ) : (
                members.map((m) => {
                  const role = ROLE_LABELS[m.role] ?? {
                    label: m.role,
                    className: "bg-muted-soft text-muted",
                  };
                  const isLoading = isPending && pendingId === m.id;
                  const isMe = m.id === currentUserId;
                  return (
                    <tr
                      key={m.id}
                      className="border-b border-border/40 last:border-0 hover:bg-muted-soft/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">
                          {[m.firstName, m.lastName]
                            .filter(Boolean)
                            .join(" ") || "Sans nom"}
                          {isMe && (
                            <span className="ml-2 text-[10px] text-terracotta uppercase font-semibold tracking-wide">
                              Vous
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-light">{m.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        {isSuperAdmin ? (
                          <select
                            value={m.role}
                            onChange={(e) =>
                              handleRoleChange(m.id, e.target.value)
                            }
                            disabled={isLoading || (isMe && m.role === "super_admin")}
                            className="px-2 py-1 border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-terracotta/20 disabled:opacity-50"
                          >
                            {ROLE_OPTIONS.map((r) => (
                              <option key={r} value={r}>
                                {ROLE_LABELS[r]?.label ?? r}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-xs font-medium",
                              role.className,
                            )}
                          >
                            {role.label}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {m.createdAt ? formatDate(m.createdAt) : "—"}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {m.lastSignInAt
                          ? formatDate(m.lastSignInAt)
                          : "Jamais"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
                            m.isActive
                              ? "bg-success-soft text-success"
                              : "bg-muted-soft text-muted",
                          )}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          {m.isActive ? "Actif" : "Désactivé"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isSuperAdmin && !isMe && (
                          <button
                            onClick={() =>
                              handleToggleActive(m.id, m.isActive)
                            }
                            disabled={isLoading}
                            className="text-xs text-muted hover:text-terracotta transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                          >
                            {isLoading && (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            )}
                            {m.isActive ? "Désactiver" : "Activer"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
