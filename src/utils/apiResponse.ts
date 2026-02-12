/**
 * @module utils/apiResponse
 * @description Helpers pour standardiser le format de toutes les réponses JSON de l'API.
 *
 * Toutes les réponses suivent un format uniforme :
 * - Succès : `{ success: true, ...data }`
 * - Erreur : `{ success: false, error: "message", details?: ... }`
 *
 * @example
 * ```ts
 * import { successResponse, errorResponse } from '@/utils/apiResponse.js';
 *
 * // Succès simple
 * res.json(successResponse());
 * // → { success: true }
 *
 * // Succès avec données
 * res.json(successResponse({ data: users, pagination }));
 * // → { success: true, data: [...], pagination: { ... } }
 *
 * // Erreur avec détails
 * res.status(400).json(errorResponse('Données invalides', zodErrors));
 * // → { success: false, error: "Données invalides", details: [...] }
 * ```
 */

/**
 * Construit une réponse de succès standardisée.
 *
 * Les données fournies sont spread à la racine de l'objet retourné,
 * aux côtés de `success: true`.
 *
 * @typeParam T - Structure des données additionnelles
 * @param data - Données à inclure dans la réponse (spread à la racine)
 * @returns Objet avec `success: true` et les données fournies
 */
export function successResponse<T extends Record<string, unknown> = Record<string, never>>(data?: T) {
  return { success: true as const, ...data };
}

/**
 * Construit une réponse d'erreur standardisée.
 *
 * @param message - Message d'erreur lisible par le client
 * @param details - Détails techniques optionnels (ex: issues Zod, stack trace en dev)
 * @returns Objet avec `success: false`, le message d'erreur et les détails éventuels
 */
export function errorResponse(message: string, details?: unknown) {
  return { success: false as const, error: message, ...(details ? { details } : {}) };
}
