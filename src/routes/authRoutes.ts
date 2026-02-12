/**
 * @module routes/authRoutes
 * @description Routes d'authentification (publiques).
 *
 * | Méthode | Route             | Description       |
 * |---------|-------------------|-------------------|
 * | POST    | `/api/auth/login` | Connexion (JWT)   |
 */
import express from 'express';

import { loginHandler } from '@/controllers/authController.js';
import { validateBody } from '@/middleware/validateMiddleware.js';
import { LoginSchema } from '@/schemas/authSchema.js';

const router = express.Router();

router.post('/login', validateBody(LoginSchema), loginHandler);

export default router;
