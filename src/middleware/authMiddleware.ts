/**
 * @module middleware/authMiddleware
 * @description Middleware d'authentification JWT.
 *
 * Vérifie la présence et la validité d'un token JWT dans :
 * 1. Le header `Authorization: Bearer <token>`
 * 2. Le cookie `authToken`
 *
 * Si le token est valide, les informations décodées sont attachées à `request.user`
 * et la requête continue. Si le token est absent, une 401 est retournée directement.
 * Si le token est invalide ou expiré, l'erreur est propagée au `errorMiddleware`.
 *
 * @example
 * ```ts
 * import { authMiddleware } from '@/middleware/authMiddleware.js';
 *
 * // Protéger une route unique
 * router.get('/protected', authMiddleware, handler);
 *
 * // Protéger un routeur entier
 * apiRouter.use('/admin', authMiddleware, adminRoutes);
 * ```
 */
import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';

import { env } from '@/config/env.js';
import { errorResponse } from '@/utils/apiResponse.js';

/**
 * Payload décodé depuis le JWT.
 * Étend le `JwtPayload` standard avec les champs applicatifs.
 */
interface AuthPayload extends JwtPayload {
  /** Indique si l'utilisateur est authentifié */
  authenticated: boolean;
  /** Timestamp de création du token (ms depuis epoch) */
  timestamp: number;
}

/**
 * Extension de l'interface Request Express avec les données utilisateur
 * extraites du JWT après authentification.
 *
 * Utilisez ce type dans les controllers qui nécessitent l'authentification :
 * ```ts
 * export async function handler(req: AuthenticatedRequest, res: Response) {
 *   console.log(req.user?.authenticated);
 * }
 * ```
 */
export interface AuthenticatedRequest extends Request {
  /** Données utilisateur décodées depuis le JWT (présent uniquement si authentifié) */
  user?: {
    /** Indique si l'utilisateur est authentifié */
    authenticated: boolean;
    /** Timestamp de création du token (ms depuis epoch) */
    timestamp: number;
  };
}

/**
 * Middleware Express qui vérifie le JWT et attache les données utilisateur à la requête.
 *
 * Extraction du token (par priorité) :
 * 1. Header `Authorization: Bearer <token>`
 * 2. Cookie `authToken`
 *
 * @param request - Requête Express enrichie avec `user` après vérification
 * @param response - Réponse Express
 * @param next - Passe au middleware/handler suivant si le token est valide
 */
export function authMiddleware(request: AuthenticatedRequest, response: Response, next: NextFunction): void {
  const authHeader = request.headers.authorization;
  const token = (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined) || request.cookies?.authToken;

  if (!token) {
    response.status(401).json(errorResponse("Token d'authentification manquant"));
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload;

    request.user = {
      authenticated: decoded.authenticated,
      timestamp: decoded.timestamp,
    };

    next();
  } catch (error) {
    next(error);
  }
}
