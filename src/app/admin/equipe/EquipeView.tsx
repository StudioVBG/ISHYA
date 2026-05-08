"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Loader2, ShieldCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import type { AdminTeamMember } from "@/lib/queries/admin";
import {
  promoteUserByEmail,
  toggleMemberActive,
  updateMemberRole,
} from "./actions";

const ROLE_LABELS: Record<string, { label: string; className: string }> = {
  admin: {
    label: "Admin",
    className: "bg-accent-purple-soft text-accent-purple",
  },
  customer: {
    label: "Client",
    className: "bg-bone-soft text-steel",
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
  const [promoteEmail, setPromoteEmail] = useState("");
  const [isPromotePending, startPromoteTransition] = useTransition();

  const handlePromote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoteEmail.trim()) return;
    startPromoteTransition(async () => {
      const res = await promoteUserByEmail(promoteEmail);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success(`${promoteEmail.trim()} est maintenant admin`);
      setPromoteEmail("");
    });
  };

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
        <p className="text-sm text-steel">
          {members.length} admin{members.length > 1 ? "s" : ""}
        </p>
        <p className="text-xs text-steel-soft mt-1">
          Promeut un client existant en admin pour lui donner accès au tableau
          de bord.
        </p>
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="bg-white rounded-xl border border-border p-5"
      >
        <h3 className="text-sm font-semibold text-foreground mb-1 inline-flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-ember" />
          Promouvoir un client en admin
        </h3>
        <p className="text-xs text-steel-soft mb-3">
          Saisissez l&apos;email d&apos;un compte client existant. L&apos;action
          est tracée dans le journal d&apos;audit.
        </p>
        <form onSubmit={handlePromote} className="flex gap-2">
          <input
            type="email"
            value={promoteEmail}
            onChange={(e) => setPromoteEmail(e.target.value)}
            placeholder="email@exemple.com"
            disabled={isPromotePending}
            className="flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ember/20 disabled:opacity-50"
            aria-label="Email du client à promouvoir"
          />
          <button
            type="submit"
            disabled={isPromotePending || !promoteEmail.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-foreground text-white rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
          >
            {isPromotePending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            Promouvoir
          </button>
        </form>
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="bg-white rounded-xl border border-border overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bone-soft/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-steel uppercase tracking-wider">
                  Membre
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-steel uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-steel uppercase tracking-wider">
                  Inscription
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-steel uppercase tracking-wider">
                  Dernière connexion
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-steel uppercase tracking-wider">
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
                    className="px-4 py-12 text-center text-steel-soft"
                  >
                    Aucun admin pour l&apos;instant.
                  </td>
                </tr>
              ) : (
                members.map((m) => {
                  const role = ROLE_LABELS[m.role] ?? {
                    label: m.role,
                    className: "bg-bone-soft text-steel",
                  };
                  const isLoading = isPending && pendingId === m.id;
                  const isMe = m.id === currentUserId;
                  return (
                    <tr
                      key={m.id}
                      className="border-b border-border/40 last:border-0 hover:bg-bone-soft/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">
                          {[m.firstName, m.lastName]
                            .filter(Boolean)
                            .join(" ") || "Sans nom"}
                          {isMe && (
                            <span className="ml-2 text-[10px] text-ember uppercase font-semibold tracking-wide">
                              Vous
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-steel-soft">{m.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={m.role}
                          onChange={(e) =>
                            handleRoleChange(m.id, e.target.value)
                          }
                          disabled={isLoading || (isMe && m.role === "admin")}
                          className="px-2 py-1 border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-ember/20 disabled:opacity-50"
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
                      <td className="px-4 py-3 text-steel">
                        {m.createdAt ? formatDate(m.createdAt) : "—"}
                      </td>
                      <td className="px-4 py-3 text-steel">
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
                              : "bg-bone-soft text-steel",
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
                            className="text-xs text-steel hover:text-ember transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
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
