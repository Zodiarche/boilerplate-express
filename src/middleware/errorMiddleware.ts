/**
 * @module middleware/errorMiddleware
 * @description Middleware Express global de gestion d'erreurs.
 *
 * Intercepte toutes les erreurs non gérées par les controllers et retourne
 * une réponse JSON standardisée selon le type d'erreur :
 *
 * | Type d'erreur       | Code HTTP      | Message                              |
 * |---------------------|----------------|--------------------------------------|
 * | `HttpError`         | err.statusCode | err.message                          |
 * | `ZodError`          | 400            | Données invalides                    |
 * | `JsonWebTokenError` | 401            | Token invalide                       |
 * | `TokenExpiredError` | 401            | Token expiré                         |
 * | Autre               | 500            | Erreur serveur (détails masqués en prod) |
 *
 * Doit être enregistré **après** toutes les routes dans `server.ts`.
 */
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

import { env } from '@/config/env.js';
import { errorResponse } from '@/utils/apiResponse.js';
import { HttpError } from '@/utils/HttpError.js';
import { logger } from '@/utils/logger.js';

/**
 * Middleware Express de gestion centralisée des erreurs.
 *
 * Express identifie un error handler par sa signature à 4 paramètres `(err, req, res, next)`.
 *
 * @param err - Erreur interceptée (typée `Error` mais peut être `HttpError`, `ZodError`, etc.)
 * @param _req - Requête Express (non utilisée)
 * @param res - Réponse Express
 * @param _next - Fonction next (non utilisée, requise par la signature Express)
 */
export function errorMiddleware(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json(errorResponse(err.message));
    return;
  }

  if (err instanceof z.ZodError) {
    res.status(400).json(errorResponse('Données invalides', err.issues));
    return;
  }

  if (err instanceof jwt.JsonWebTokenError) {
    res.status(401).json(errorResponse('Token invalide'));
    return;
  }

  if (err instanceof jwt.TokenExpiredError) {
    res.status(401).json(errorResponse('Token expiré'));
    return;
  }

  logger.error('Erreur non gérée', { message: err.message, stack: err.stack });

  const message = env.NODE_ENV === 'production' ? 'Erreur serveur' : err.message;
  res.status(500).json(errorResponse(message));
}
