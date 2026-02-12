/**
 * @module utils/logger
 * @description Logger structuré avec horodatage ISO 8601 et niveaux de sévérité.
 *
 * Produit des messages au format : `[timestamp] [LEVEL] message {context}`
 *
 * @example
 * ```ts
 * import { logger } from '@/utils/logger.js';
 *
 * logger.info('Serveur démarré', { port: 3000 });
 * // [2025-01-15T10:30:00.000Z] [INFO] Serveur démarré {"port":3000}
 *
 * logger.error('Échec connexion', { host: 'localhost' });
 * // [2025-01-15T10:30:00.000Z] [ERROR] Échec connexion {"host":"localhost"}
 * ```
 */

/** Niveaux de sévérité supportés par le logger */
type LogLevel = 'info' | 'warn' | 'error';

/**
 * Formate un message de log avec horodatage, niveau et contexte optionnel.
 *
 * @param level - Niveau de sévérité du message
 * @param message - Message principal à afficher
 * @param context - Données contextuelles additionnelles (sérialisées en JSON)
 * @returns Message formaté prêt à être affiché en console
 */
function formatMessage(level: LogLevel, message: string, context?: Record<string, unknown>): string {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  return context ? `${base} ${JSON.stringify(context)}` : base;
}

/**
 * Logger applicatif avec sortie console structurée.
 *
 * - `info` → `console.log` (opérations normales)
 * - `warn` → `console.warn` (situations anormales non bloquantes)
 * - `error` → `console.error` (échecs nécessitant une attention)
 */
export const logger = {
  /**
   * Log de niveau informatif (opérations normales).
   * @param message - Message à logger
   * @param context - Données contextuelles optionnelles
   */
  info(message: string, context?: Record<string, unknown>): void {
    console.log(formatMessage('info', message, context));
  },
  /**
   * Log de niveau avertissement (situations anormales non bloquantes).
   * @param message - Message à logger
   * @param context - Données contextuelles optionnelles
   */
  warn(message: string, context?: Record<string, unknown>): void {
    console.warn(formatMessage('warn', message, context));
  },
  /**
   * Log de niveau erreur (échecs nécessitant une attention).
   * @param message - Message à logger
   * @param context - Données contextuelles optionnelles
   */
  error(message: string, context?: Record<string, unknown>): void {
    console.error(formatMessage('error', message, context));
  },
};
