/**
 * @module config/database
 * @description Pool de connexions MySQL partagé par toute l'application.
 *
 * Utilise les variables d'environnement validées depuis `config/env`.
 * Le pool gère automatiquement l'ouverture, la réutilisation et la fermeture
 * des connexions.
 *
 * @example
 * ```ts
 * import pool from '@/config/database.js';
 * const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [1]);
 * ```
 */
import mysql from 'mysql2/promise';

import { env } from './env.js';

const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  connectionLimit: env.DB_POOL_SIZE,
  waitForConnections: true,
  queueLimit: 0,
});

export default pool;
