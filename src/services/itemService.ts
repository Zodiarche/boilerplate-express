/**
 * @module services/itemService
 * @description Logique métier pour la ressource "items".
 *
 * Le service orchestre les appels au repository et applique
 * les règles métier (pagination, validation d'existence, etc.).
 *
 * @example
 * ```ts
 * import * as itemService from '@/services/itemService.js';
 *
 * const { data, pagination } = await itemService.listItems(1, 20, 'name', 'asc');
 * const item = await itemService.getItem(42);
 * const id = await itemService.createItem({ name: 'Mon item' });
 * ```
 */
import { env } from '@/config/env.js';
import * as itemRepo from '@/repositories/itemRepository.js';
import type { CreateItem, UpdateItem } from '@/schemas/itemSchema.js';
import { HttpError } from '@/utils/HttpError.js';

/**
 * Liste les items avec pagination et tri.
 *
 * La taille de page est bornée par `DEFAULT_PAGE_LIMIT` et `MAX_PAGE_LIMIT`
 * définis dans les variables d'environnement.
 *
 * @param page - Numéro de page (commence à 1)
 * @param limit - Nombre d'éléments par page (optionnel, utilise `DEFAULT_PAGE_LIMIT` par défaut)
 * @param sortBy - Champ de tri (optionnel)
 * @param sortDirection - Direction du tri : `'asc'` ou `'desc'` (optionnel, défaut: `DESC`)
 * @returns Objet contenant `data` (items) et `pagination` (total, page, limit, totalPages)
 */
export async function listItems(page = 1, limit?: number, sortBy?: string, sortDirection?: string) {
  const pageLimit = Math.min(limit ?? env.DEFAULT_PAGE_LIMIT, env.MAX_PAGE_LIMIT);
  const offset = (page - 1) * pageLimit;
  const direction = sortDirection?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const [items, total] = await Promise.all([
    itemRepo.findAll(pageLimit, offset, sortBy, direction),
    itemRepo.countAll(),
  ]);

  return {
    data: items,
    pagination: {
      total,
      page,
      limit: pageLimit,
      totalPages: Math.ceil(total / pageLimit),
    },
  };
}

/**
 * Récupère un item par son identifiant.
 *
 * @param id - Identifiant de l'item
 * @returns L'item trouvé
 * @throws {HttpError} 404 si l'item n'existe pas
 */
export async function getItem(id: number) {
  const item = await itemRepo.findById(id);
  if (!item) throw new HttpError(404, 'Item introuvable');
  return item;
}

/**
 * Crée un nouvel item.
 *
 * @param input - Données de création validées
 * @returns Identifiant de l'item créé
 */
export async function createItem(input: CreateItem) {
  return itemRepo.create(input);
}

/**
 * Met à jour partiellement un item existant.
 *
 * Vérifie l'existence de l'item avant la mise à jour.
 *
 * @param id - Identifiant de l'item à modifier
 * @param patch - Champs à mettre à jour
 * @returns Résultat MySQL
 * @throws {HttpError} 404 si l'item n'existe pas
 */
export async function updateItem(id: number, patch: UpdateItem) {
  await getItem(id);
  return itemRepo.update(id, patch);
}

/**
 * Supprime un item.
 *
 * Vérifie l'existence de l'item avant la suppression.
 *
 * @param id - Identifiant de l'item à supprimer
 * @returns Résultat MySQL
 * @throws {HttpError} 404 si l'item n'existe pas
 */
export async function deleteItem(id: number) {
  await getItem(id);
  return itemRepo.remove(id);
}
