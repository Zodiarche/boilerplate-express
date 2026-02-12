/**
 * @module controllers/itemController
 * @description Handlers Express pour la ressource "items".
 *
 * Chaque handler :
 * 1. Extrait les données de la requête (body, query, params pré-validés par les middlewares)
 * 2. Délègue au service métier
 * 3. Retourne une réponse standardisée via `successResponse()`
 *
 * L'authentification est requise (routes protégées par `authMiddleware` au niveau du routeur parent).
 */
import type { Request, Response } from 'express';

import * as itemService from '@/services/itemService.js';
import { successResponse } from '@/utils/apiResponse.js';

/**
 * Handler de listing des items avec pagination et tri.
 *
 * @param req - Requête Express (query pré-validée : page?, limit?, sortBy?, sortDirection?)
 * @param res - Réponse Express avec `{ success, data, pagination }`
 */
export async function listItemsHandler(req: Request, res: Response): Promise<void> {
  const { page, limit, sortBy, sortDirection } = req.query as Record<string, string>;
  const result = await itemService.listItems(
    page ? Number(page) : undefined,
    limit ? Number(limit) : undefined,
    sortBy,
    sortDirection,
  );
  res.json(successResponse({ data: result.data, pagination: result.pagination }));
}

/**
 * Handler de récupération d'un item par son identifiant.
 *
 * @param req - Requête Express (params pré-validés : `{ id: number }`)
 * @param res - Réponse Express avec `{ success, data }`
 */
export async function getItemHandler(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const item = await itemService.getItem(id);
  res.json(successResponse({ data: item }));
}

/**
 * Handler de création d'un item.
 *
 * @param req - Requête Express (body pré-validé : `{ name, description? }`)
 * @param res - Réponse Express 201 avec `{ success, id }`
 */
export async function createItemHandler(req: Request, res: Response): Promise<void> {
  const id = await itemService.createItem(req.body);
  res.status(201).json(successResponse({ id }));
}

/**
 * Handler de mise à jour partielle d'un item.
 *
 * @param req - Requête Express (params : `{ id }`, body pré-validé : `{ name?, description? }`)
 * @param res - Réponse Express avec `{ success }`
 */
export async function updateItemHandler(req: Request, res: Response): Promise<void> {
  await itemService.updateItem(Number(req.params.id), req.body);
  res.json(successResponse());
}

/**
 * Handler de suppression d'un item.
 *
 * @param req - Requête Express (params pré-validés : `{ id: number }`)
 * @param res - Réponse Express 204 No Content
 */
export async function deleteItemHandler(req: Request, res: Response): Promise<void> {
  await itemService.deleteItem(Number(req.params.id));
  res.status(204).end();
}
