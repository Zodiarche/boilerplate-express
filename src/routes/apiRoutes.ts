/**
 * @module routes/apiRoutes
 * @description Routeur principal de l'API.
 *
 * Agrège tous les sous-routeurs et applique l'authentification
 * sur les routes qui le nécessitent.
 *
 * | Préfixe          | Module      | Auth requise |
 * |------------------|-------------|:------------:|
 * | `/api/auth`      | authRoutes  | Non          |
 * | `/api/items`     | itemRoutes  | Oui          |
 *
 * Pour ajouter une nouvelle ressource :
 * 1. Créer le fichier routes (ex: `userRoutes.ts`)
 * 2. L'importer ici et le monter sur un préfixe
 */
import express from 'express';

import { authMiddleware } from '@/middleware/authMiddleware.js';
import authRoutes from '@/routes/authRoutes.js';
import itemRoutes from '@/routes/itemRoutes.js';

const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/items', authMiddleware, itemRoutes);

export default apiRouter;
