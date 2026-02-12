/**
 * @module interfaces/repositories
 * @description Interfaces TypeScript définissant les contrats des repositories.
 *
 * Ces interfaces documentent l'API publique de chaque repository et permettent :
 * - De typer les mocks dans les tests unitaires
 * - De garantir la cohérence entre l'implémentation et les attentes des services
 * - De faciliter le remplacement d'un repository par une autre implémentation
 *
 * Ajoutez ici l'interface de chaque nouveau repository.
 *
 * @example
 * ```ts
 * // Dans un test, on peut créer un mock typé :
 * const mockRepo: IItemRepository = {
 *   findAll: vi.fn().mockResolvedValue([]),
 *   countAll: vi.fn().mockResolvedValue(0),
 *   findById: vi.fn().mockResolvedValue(null),
 *   create: vi.fn().mockResolvedValue(1),
 *   update: vi.fn().mockResolvedValue({ affectedRows: 1 }),
 *   remove: vi.fn().mockResolvedValue({ affectedRows: 1 }),
 * };
 * ```
 */
import type { ResultSetHeader } from 'mysql2';

import type { CreateItem, Item, UpdateItem } from '@/schemas/itemSchema.js';

/**
 * Contrat du repository d'accès aux items.
 * Opérations CRUD sur la table `items`.
 */
export interface IItemRepository {
  /**
   * Liste les items avec tri et pagination.
   * @param limit - Nombre maximal d'éléments à retourner
   * @param offset - Nombre d'éléments à ignorer (pour la pagination)
   * @param sortBy - Champ de tri (défaut: `created_at`)
   * @param sortDirection - Direction du tri (`ASC` ou `DESC`)
   * @returns Liste des items correspondants
   */
  findAll(limit: number, offset: number, sortBy?: string, sortDirection?: 'ASC' | 'DESC'): Promise<Item[]>;

  /**
   * Compte le nombre total d'items.
   * @returns Nombre total d'items en base
   */
  countAll(): Promise<number>;

  /**
   * Récupère un item par son identifiant.
   * @param id - Identifiant de l'item
   * @returns L'item trouvé ou `null` si introuvable
   */
  findById(id: number): Promise<Item | null>;

  /**
   * Crée un nouvel item.
   * @param input - Données de création validées
   * @returns Identifiant de l'item créé (`insertId`)
   */
  create(input: CreateItem): Promise<number>;

  /**
   * Met à jour partiellement un item existant.
   * @param id - Identifiant de l'item à modifier
   * @param patch - Champs à mettre à jour (seuls les champs présents sont modifiés)
   * @returns Résultat MySQL contenant `affectedRows` et `changedRows`
   */
  update(id: number, patch: UpdateItem): Promise<ResultSetHeader>;

  /**
   * Supprime un item par son identifiant.
   * @param id - Identifiant de l'item à supprimer
   * @returns Résultat MySQL contenant `affectedRows`
   */
  remove(id: number): Promise<ResultSetHeader>;
}
