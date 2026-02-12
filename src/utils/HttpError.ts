/**
 * @module utils/HttpError
 * @description Classe d'erreur HTTP personnalisée avec code de statut.
 *
 * Permet aux services de lever des erreurs métier typées
 * (404, 409, 403...) qui seront interceptées par le `errorMiddleware`
 * et retournées au client avec le bon code HTTP.
 *
 * @example
 * ```ts
 * import { HttpError } from '@/utils/HttpError.js';
 *
 * throw new HttpError(404, 'Ressource introuvable');
 * throw new HttpError(409, 'Conflit : cette entrée existe déjà');
 * throw new HttpError(403, 'Accès interdit');
 * ```
 */

/**
 * Erreur HTTP avec code de statut exploitable par le middleware d'erreur.
 *
 * Hérite de `Error` natif et ajoute un `statusCode` numérique.
 * Le `errorMiddleware` détecte cette classe
 * via `instanceof` et utilise `statusCode` pour la réponse HTTP.
 */
export class HttpError extends Error {
  /**
   * @param statusCode - Code HTTP à retourner au client (ex: 400, 404, 409)
   * @param message - Message d'erreur lisible par le client
   */
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}
