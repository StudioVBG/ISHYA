"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import type { AdminTeamMember } from "@/lib/queries/admin";
import { toggleMemberActive, updateMemberRole } from "./actions";

const ROLE_LABELS: Record<string, { label: string; className: string }> = {
  admin: {
    label: "Admin",
    className: "bg-accent-purple-soft text-accent-purple",
  },
  customer: {
    label: "Client",
    className: "bg-muted-soft text-muted",
  },
};

const ROLE_OPTIONS = ["admin", "customer"];

export function EquipeView({
  members,
  currentUserId,
}: {
  members: AdminTeamMember[];
  currentUserId: string;
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
          {members.length} admin{members.length > 1 ? "s" : ""}
        </p>
        <p className="text-xs text-muted-light mt-1">
          Promeut un client en admin pour lui donner accès au tableau de bord.
        </p>
      </motion.div>

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
                    Aucun admin pour l&apos;instant.
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
                        <select
                          value={m.role}
                          onChange={(e) =>
                            handleRoleChange(m.id, e.target.value)
                          }
                          disabled={isLoading || (isMe && m.role === "admin")}
                          className="px-2 py-1 border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-terracotta/20 disabled:opacity-50"
                          title={
                            isMe && m.role === "admin"
                              ? "Vous ne pouvez pas retirer votre propre rôle d'admin"
                              : undefined
                          }
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r}>
                              {ROLE_LABELS[r]?.label ?? r}
                            </option>
                          ))}
                        </select>
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
                        <span className="sr-only">{role.label}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {!isMe && (
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
