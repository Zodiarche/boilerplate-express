/**
 * @module schemas/authSchema
 * @description Schémas Zod pour l'authentification.
 *
 * Utilisé par `POST /api/auth/login` pour valider le body de la requête.
 */
import { z } from 'zod';

/**
 * Schéma de validation pour la connexion.
 * Utilisé par le middleware `validateBody` sur la route `POST /api/auth/login`.
 */
export const LoginSchema = z.object({
  /** Mot de passe de l'administrateur */
  password: z.string().min(1, 'Le mot de passe est requis'),
});

/** Type inféré du body de login */
export type LoginInput = z.infer<typeof LoginSchema>;
