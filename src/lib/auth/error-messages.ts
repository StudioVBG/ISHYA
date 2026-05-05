// Traduction centralisée des messages d'erreur Supabase Auth.
// Les messages renvoyés par GoTrue sont en anglais ; on les expose à
// l'utilisateur en français avec un ton aligné sur la marque.

const PATTERNS: Array<{ test: RegExp; message: string }> = [
  {
    test: /invalid login credentials/i,
    message: "Email ou mot de passe incorrect.",
  },
  {
    test: /email not confirmed/i,
    message: "Veuillez confirmer votre email avant de vous connecter.",
  },
  {
    test: /already registered|already exists|user already/i,
    message: "Un compte existe déjà avec cet email.",
  },
  {
    test: /password should be at least|password.*too short|password.*weak/i,
    message: "Le mot de passe doit contenir au moins 8 caractères.",
  },
  {
    test: /same password|new password should be different/i,
    message: "Le nouveau mot de passe doit être différent de l'ancien.",
  },
  {
    test: /rate limit|too many requests/i,
    message: "Trop de tentatives. Réessayez dans quelques minutes.",
  },
  {
    test: /token has expired|expired/i,
    message: "Ce lien a expiré. Demandez-en un nouveau.",
  },
  {
    test: /invalid token|invalid otp/i,
    message: "Lien ou code invalide. Demandez-en un nouveau.",
  },
  {
    test: /user not found/i,
    message: "Aucun compte trouvé avec cet email.",
  },
  {
    test: /signup.*disabled/i,
    message: "Les inscriptions sont temporairement désactivées.",
  },
  {
    test: /network|fetch/i,
    message: "Connexion impossible. Vérifiez votre réseau et réessayez.",
  },
];

const FALLBACK = "Une erreur est survenue. Veuillez réessayer.";

export function translateAuthError(
  error: { message?: string | null } | null | undefined,
): string {
  const raw = error?.message?.trim();
  if (!raw) return FALLBACK;
  for (const { test, message } of PATTERNS) {
    if (test.test(raw)) return message;
  }
  return FALLBACK;
}

// Erreurs Postgres/PostgREST (codes SQLSTATE et codes PostgREST).
const PG_CODES: Record<string, string> = {
  "23505": "Cet élément existe déjà.",
  "23503": "Référence invalide : l'élément lié n'existe pas ou plus.",
  "23502": "Un champ obligatoire est manquant.",
  "23514": "Valeur invalide.",
  "42501": "Vous n'avez pas les droits nécessaires.",
  PGRST116: "Aucun résultat trouvé.",
  PGRST301: "Accès refusé.",
};

export function translatePostgresError(
  error: { code?: string | null; message?: string | null } | null | undefined,
): string {
  if (!error) return FALLBACK;
  if (error.code && PG_CODES[error.code]) return PG_CODES[error.code];
  if (error.message?.toLowerCase().includes("duplicate")) {
    return PG_CODES["23505"];
  }
  return FALLBACK;
}
