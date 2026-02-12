/**
 * @module controllers/authController
 * @description Handler Express pour l'authentification.
 *
 * Gère la connexion par mot de passe avec vérification bcrypt,
 * génération de JWT et envoi du token via cookie HttpOnly et body JSON.
 *
 * Le body est pré-validé par `validateBody(LoginSchema)` dans les routes.
 * L'authentification utilise un mot de passe unique hashé en bcrypt
 * stocké dans la variable d'environnement `PASSWORD_HASH`.
 */
import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { env } from '@/config/env.js';
import { errorResponse, successResponse } from '@/utils/apiResponse.js';

/**
 * Handler de connexion.
 *
 * Vérifie le mot de passe contre le hash bcrypt configuré dans `PASSWORD_HASH`.
 * En cas de succès, génère un JWT et le retourne à la fois :
 * - Dans un cookie `authToken` (HttpOnly, Secure en production, SameSite strict)
 * - Dans le body JSON `{ success: true, token: "..." }`
 *
 * @param req - Requête Express (body pré-validé : `{ password: string }`)
 * @param res - Réponse Express
 */
export async function loginHandler(req: Request, res: Response): Promise<void> {
  const { password } = req.body;

  const isValid = await bcrypt.compare(password, env.PASSWORD_HASH);
  if (!isValid) {
    res.status(401).json(errorResponse('Mot de passe incorrect'));
    return;
  }

  const token = jwt.sign(
    { authenticated: true, timestamp: Date.now() },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRY },
  );

  res.cookie('authToken', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: env.JWT_EXPIRY * 1000,
  });

  res.json(successResponse({ token }));
}
