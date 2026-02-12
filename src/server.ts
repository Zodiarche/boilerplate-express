/**
 * @module server
 * @description Point d'entrée de l'application Express.
 *
 * Configure et démarre le serveur HTTP avec :
 * - **Sécurité** : Helmet (headers HTTP), CORS
 * - **Parsing** : JSON (limité à 1 Mo), cookies
 * - **Logging** : Morgan (requêtes HTTP) — format `dev` ou `combined` selon NODE_ENV
 * - **Routes API** : montées sur `/api` via le routeur principal
 * - **Health check** : `GET /health` pour la supervision (vérifie la connectivité MySQL)
 * - **404** : handler JSON pour les routes inconnues
 * - **Gestion d'erreurs** : middleware global en fin de chaîne
 * - **Graceful shutdown** : fermeture propre du serveur et du pool MySQL
 *
 * L'ordre des middlewares est important :
 * 1. Helmet → CORS → Morgan → JSON parser → Cookie parser
 * 2. Routes (health check, API)
 * 3. 404 handler
 * 4. Error middleware (doit être le dernier)
 */
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import pool from '@/config/database.js';
import { env } from '@/config/env.js';
import { errorMiddleware } from '@/middleware/errorMiddleware.js';
import apiRoutes from '@/routes/apiRoutes.js';
import { errorResponse } from '@/utils/apiResponse.js';
import { logger } from '@/utils/logger.js';

const application = express();

application.use(helmet());
application.use(cors(env.CORS_ORIGIN ? { origin: env.CORS_ORIGIN.split(','), credentials: true } : undefined));
application.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
application.use(express.json({ limit: '1mb' }));
application.use(cookieParser());

application.get('/health', async (_req: Request, res: Response) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'error', timestamp: new Date().toISOString() });
  }
});

application.use('/api', apiRoutes);

application.use((_req: Request, res: Response) => {
  res.status(404).json(errorResponse('Route introuvable'));
});

application.use(errorMiddleware);

const server = application.listen(env.PORT, () => {
  logger.info(`Serveur démarré sur le port ${env.PORT}`, { env: env.NODE_ENV });
});

/**
 * Arrête proprement le serveur HTTP et ferme le pool de connexions MySQL.
 *
 * Appelé automatiquement sur les signaux `SIGTERM` et `SIGINT`.
 * Permet aux requêtes en cours de se terminer avant la fermeture.
 * Un timeout de 10 secondes force l'arrêt si la fermeture propre échoue.
 *
 * @param signal - Nom du signal reçu (ex: `'SIGTERM'`, `'SIGINT'`)
 */
function gracefulShutdown(signal: string) {
  logger.info(`${signal} reçu, arrêt en cours...`);

  setTimeout(() => {
    logger.error('Fermeture forcée (timeout 10s dépassé)');
    process.exit(1);
  }, 10_000).unref();

  server.close(async () => {
    await pool.end();
    logger.info('Serveur arrêté proprement');
    process.exit(0);
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
