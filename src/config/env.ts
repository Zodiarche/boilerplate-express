/**
 * @module config/env
 * @description Chargement et validation des variables d'environnement au démarrage.
 *
 * Charge le fichier `.env` via dotenv **avant** la validation, garantissant
 * que les variables sont disponibles même en ESM (où les imports sont hoistés).
 * Utilise Zod pour vérifier la présence et le format de chaque variable.
 * Si une variable requise est manquante ou invalide, le processus s'arrête
 * immédiatement avec un message d'erreur explicite.
 *
 * @example
 * ```ts
 * import { env } from '@/config/env.js';
 * console.log(env.PORT);      // number, garanti valide
 * console.log(env.NODE_ENV);  // 'development' | 'production' | 'test'
 * ```
 */
import dotenv from 'dotenv';
dotenv.config();

import { z } from 'zod';

const envSchema = z.object({
  /** Environnement d'exécution */
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  /** Port d'écoute du serveur HTTP */
  PORT: z.coerce.number().int().positive().default(3000),

  /** Hôte de la base de données MySQL */
  DB_HOST: z.string().min(1, 'DB_HOST is required'),
  /** Port de la base de données MySQL */
  DB_PORT: z.coerce.number().int().positive().default(3306),
  /** Utilisateur MySQL */
  DB_USER: z.string().min(1, 'DB_USER is required'),
  /** Mot de passe MySQL */
  DB_PASSWORD: z.string().min(1, 'DB_PASSWORD is required'),
  /** Nom de la base de données MySQL */
  DB_NAME: z.string().min(1, 'DB_NAME is required'),
  /** Nombre maximal de connexions dans le pool MySQL */
  DB_POOL_SIZE: z.coerce.number().int().positive().default(10),

  /** Clé secrète utilisée pour signer les JWT */
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  /** Hash bcrypt du mot de passe administrateur */
  PASSWORD_HASH: z.string().min(1, 'PASSWORD_HASH is required'),

  /** Durée de validité des JWT en secondes (défaut : 86400 = 24h) */
  JWT_EXPIRY: z.coerce.number().int().positive().default(86400),

  /** Origine(s) CORS autorisée(s), séparées par des virgules (ex: "https://example.com,https://app.example.com"). Si absent, toutes les origines sont autorisées (développement). */
  CORS_ORIGIN: z.string().optional(),

  /** Nombre d'éléments par page par défaut pour la pagination */
  DEFAULT_PAGE_LIMIT: z.coerce.number().int().positive().default(10),
  /** Nombre maximal d'éléments par page autorisé */
  MAX_PAGE_LIMIT: z.coerce.number().int().positive().default(100),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

/**
 * Variables d'environnement validées et typées.
 * Toutes les valeurs sont garanties présentes et conformes au schéma.
 */
export const env = parsed.data;
