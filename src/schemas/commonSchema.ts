/**
 * @module schemas/commonSchema
 * @description Schémas Zod partagés entre toutes les ressources.
 *
 * Contient les validations génériques réutilisables :
 * paramètres d'URL, directions de tri, etc.
 *
 * @example
 * ```ts
 * import { IdParamSchema, SortDirectionEnum } from '@/schemas/commonSchema.js';
 *
 * // Validation d'un paramètre :id
 * router.get('/:id', validateParams(IdParamSchema), handler);
 *
 * // Utilisation du tri dans un schéma de query
 * const MyQuerySchema = z.object({
 *   sortDirection: SortDirectionEnum.optional(),
 * });
 * ```
 */
import { z } from 'zod';

/**
 * Validation du paramètre `:id` dans les URLs.
 * Coerce la chaîne de caractères en entier positif.
 */
export const IdParamSchema = z.object({
  /** Identifiant numérique (coercé depuis string) */
  id: z.coerce.number().int().positive(),
});

/**
 * Directions de tri autorisées pour les requêtes de listing.
 * Valeurs possibles : `'asc'` | `'desc'`
 */
export const SortDirectionEnum = z.enum(['asc', 'desc']);

/** Type inféré de la direction de tri */
export type SortDirection = z.infer<typeof SortDirectionEnum>;
