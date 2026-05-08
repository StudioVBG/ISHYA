import "server-only";
import { z } from "zod";

export type ActionResult<T = void> =
  | (T extends void
      ? { ok: true; message?: string }
      : { ok: true; data: T; message?: string })
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

interface SafeActionOptions<TSchema extends z.ZodType, TOutput> {
  schema: TSchema;
  /**
   * Message renvoyé quand l'input ne valide pas le schema. Par défaut on
   * renvoie le premier message d'erreur Zod (en français si possible).
   */
  invalidInputMessage?: string;
  handler: (
    input: z.infer<TSchema>,
  ) => Promise<TOutput | ActionResult<TOutput>>;
}

function formatZodError(error: z.ZodError) {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!fieldErrors[key]) fieldErrors[key] = [];
    fieldErrors[key].push(issue.message);
  }
  const firstMessage = error.issues[0]?.message ?? "Données invalides";
  return { firstMessage, fieldErrors };
}

/**
 * Wrapper pour server actions : valide l'input via Zod, capture les erreurs
 * inattendues et standardise le retour ({ ok, data?, error?, fieldErrors? }).
 *
 * Le handler peut retourner soit la donnée pure (succès implicite), soit un
 * ActionResult complet pour gérer ses propres erreurs métier.
 */
export function safeAction<TSchema extends z.ZodType, TOutput = void>({
  schema,
  invalidInputMessage,
  handler,
}: SafeActionOptions<TSchema, TOutput>) {
  return async function action(rawInput: unknown): Promise<ActionResult<TOutput>> {
    const parsed = schema.safeParse(rawInput);
    if (!parsed.success) {
      const { firstMessage, fieldErrors } = formatZodError(parsed.error);
      return {
        ok: false,
        error: invalidInputMessage ?? firstMessage,
        fieldErrors,
      };
    }
    try {
      const result = await handler(parsed.data as z.infer<TSchema>);
      // Si le handler renvoie déjà un ActionResult, on le passe.
      if (
        result &&
        typeof result === "object" &&
        "ok" in result &&
        typeof (result as { ok: unknown }).ok === "boolean"
      ) {
        return result as ActionResult<TOutput>;
      }
      // Sinon, on enveloppe.
      if (result === undefined) {
        return { ok: true } as ActionResult<TOutput>;
      }
      return { ok: true, data: result } as ActionResult<TOutput>;
    } catch (err) {
      console.error("[safeAction] handler threw", err);
      return {
        ok: false,
        error: "Une erreur inattendue est survenue. Réessayez dans un instant.",
      };
    }
  };
}
