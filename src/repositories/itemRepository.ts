/**
 * @module repositories/itemRepository
 * @description Accès aux données de la table `items`.
 *
 * Toutes les requêtes SQL sont paramétrées pour éviter les injections.
 * Les champs de tri sont filtrés contre une whitelist pour empêcher
 * l'injection SQL dans les clauses `ORDER BY`.
 *
 * @example
 * ```ts
 * import * as itemRepo from '@/repositories/itemRepository.js';
 *
 * const items = await itemRepo.findAll(10, 0, 'name', 'ASC');
 * const total = await itemRepo.countAll();
 * const item = await itemRepo.findById(42);
 * ```
 */
import type { ResultSetHeader } from 'mysql2';

import pool from '@/config/database.js';
import type { CreateItem, DBItem, UpdateItem } from '@/schemas/itemSchema.js';

/** Champs de tri autorisés (whitelist anti-injection) */
const ALLOWED_SORT_FIELDS = ['id', 'name', 'created_at', 'updated_at'];

/** Directions de tri autorisées */
const ALLOWED_SORT_DIRECTIONS = ['ASC', 'DESC'];

/**
 * Liste les items avec tri et pagination.
 *
 * Les paramètres de tri sont validés contre une whitelist.
 * En cas de valeur invalide, le tri par défaut (`created_at DESC`) est appliqué.
 *
 * @param limit - Nombre maximal d'éléments à retourner
 * @param offset - Nombre d'éléments à ignorer
 * @param sortBy - Champ de tri (défaut: `created_at`)
 * @param sortDirection - Direction du tri (défaut: `DESC`)
 * @returns Liste des items
 */
export async function findAll(
  limit: number,
  offset: number,
  sortBy = 'created_at',
  sortDirection = 'DESC',
): Promise<DBItem[]> {
  const safeSortBy = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : 'created_at';
  const safeSortDir = ALLOWED_SORT_DIRECTIONS.includes(sortDirection.toUpperCase()) ? sortDirection.toUpperCase() : 'DESC';

  const [rows] = await pool.execute<DBItem[]>(
    `SELECT * FROM items ORDER BY ${safeSortBy} ${safeSortDir} LIMIT ? OFFSET ?`,
    [limit, offset],
  );
  return rows;
}

/**
 * Compte le nombre total d'items en base.
 *
 * @returns Nombre total d'items
 */
export async function countAll(): Promise<number> {
  const [rows] = await pool.execute<({ total: number } & import('mysql2').RowDataPacket)[]>(
    'SELECT COUNT(*) as total FROM items',
  );
  return rows[0].total;
}

/**
 * Récupère un item par son identifiant.
 *
 * @param id - Identifiant de l'item recherché
 * @returns L'item trouvé ou `null` si introuvable
 */
export async function findById(id: number): Promise<DBItem | null> {
  const [rows] = await pool.execute<DBItem[]>('SELECT * FROM items WHERE id = ?', [id]);
  return rows[0] ?? null;
}

/**
 * Insère un nouvel item en base.
 *
 * @param input - Données de création validées par `CreateItemSchema`
 * @returns Identifiant de l'item créé (`insertId`)
 */
export async function create(input: CreateItem): Promise<number> {
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO items (name, description) VALUES (?, ?)',
    [input.name, input.description ?? null],
  );
  return result.insertId;
}

/**
 * Met à jour partiellement un item existant.
 *
 * Construit dynamiquement la requête `UPDATE` avec uniquement les champs fournis.
 * Si aucun champ n'est à modifier, retourne un `ResultSetHeader` vide sans requête SQL.
 *
 * @param id - Identifiant de l'item à modifier
 * @param patch - Champs à mettre à jour
 * @returns Résultat MySQL contenant `affectedRows` et `changedRows`
 */
export async function update(id: number, patch: UpdateItem): Promise<ResultSetHeader> {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (patch.name !== undefined) {
    fields.push('name = ?');
    values.push(patch.name);
  }
  if (patch.description !== undefined) {
    fields.push('description = ?');
    values.push(patch.description);
  }

  if (fields.length === 0) {
    return { affectedRows: 0, fieldCount: 0, info: '', insertId: 0, serverStatus: 0, warningStatus: 0, changedRows: 0 } as ResultSetHeader;
  }

  values.push(id);
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE items SET ${fields.join(', ')} WHERE id = ?`,
    values,
  );
  return result;
}

/**
 * Supprime un item par son identifiant.
 *
 * @param id - Identifiant de l'item à supprimer
 * @returns Résultat MySQL contenant `affectedRows`
 */
export async function remove(id: number): Promise<ResultSetHeader> {
  const [result] = await pool.execute<ResultSetHeader>('DELETE FROM items WHERE id = ?', [id]);
  return result;
}
