/**
 * @module middleware/validateMiddleware
 * @description Middlewares de validation Zod pour les requêtes Express.
 *
 * Valident et transforment automatiquement le body, les query params ou les
 * route params avant que le controller ne soit exécuté.
 * En cas d'échec de validation, une `ZodError` est levée et interceptée
 * par le `errorMiddleware` qui retourne une 400.
 *
 * @example
 * ```ts
 * import { validateBody, validateQuery, validateParams } from '@/middleware/validateMiddleware.js';
 *
 * router.post('/', validateBody(CreateItemSchema), createItem);
 * router.get('/', validateQuery(ListQuerySchema), listItems);
 * router.delete('/:id', validateParams(IdParamSchema), deleteItem);
 * ```
 */
import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

/**
 * Valide et remplace `req.body` par les données parsées par le schéma Zod.
 * Les valeurs par défaut définies dans le schéma sont automatiquement appliquées.
 *
 * @param schema - Schéma Zod à utiliser pour la validation
 * @returns Middleware Express
 * @throws {ZodError} Si la validation échoue
 */
export const validateBody = (schema: ZodSchema) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    req.body = schema.parse(req.body);
    next();
  };

/**
 * Valide et enrichit `req.query` avec les données parsées par le schéma Zod.
 * Gère la coercition de types (ex: string → number pour la pagination).
 *
 * @param schema - Schéma Zod à utiliser pour la validation
 * @returns Middleware Express
 * @throws {ZodError} Si la validation échoue
 */
export const validateQuery = (schema: ZodSchema) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.parse(req.query);
    Object.assign(req.query, parsed);
    next();
  };

/**
 * Valide et enrichit `req.params` avec les données parsées par le schéma Zod.
 * Utile pour coercer les paramètres de route (ex: `:id` string → number).
 *
 * @param schema - Schéma Zod à utiliser pour la validation
 * @returns Middleware Express
 * @throws {ZodError} Si la validation échoue
 */
export const validateParams = (schema: ZodSchema) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.parse(req.params);
    Object.assign(req.params, parsed);
    next();
  };
