/**
 * @module schemas/itemSchema
 * @description Schémas Zod pour la ressource "items" (exemple).
 *
 * Couvre :
 * - Le schéma complet d'un item tel que stocké en base
 * - La création d'un item (`POST`)
 * - La mise à jour partielle (`PATCH`)
 * - Le tri et la pagination des listings (`GET`)
 *
 * Remplacez "item" par le nom de votre ressource pour créer de nouveaux modules.
 */
import type { RowDataPacket } from 'mysql2';
import { z } from 'zod';

import { SortDirectionEnum } from '@/schemas/commonSchema.js';

// ─── Schéma complet (tel que stocké en base) ────────────────────────────────

/**
 * Schéma complet d'un item tel que retourné par la base de données.
 * Correspond à la structure de la table `items`.
 */
export const ItemSchema = z.object({
  /** Identifiant unique auto-incrémenté */
  id: z.number().int(),
  /** Nom de l'item */
  name: z.string(),
  /** Description optionnelle (nullable en base) */
  description: z.string().nullable(),
  /** Date de création */
  created_at: z.coerce.date(),
  /** Date de dernière modification */
  updated_at: z.coerce.date(),
});

/** Type inféré d'un item complet */
export type Item = z.infer<typeof ItemSchema>;

/** Type d'une ligne de la table `items` retournée par mysql2 */
export type DBItem = Item & RowDataPacket;

// ─── Création ───────────────────────────────────────────────────────────────

/**
 * Schéma de validation pour la création d'un item.
 * Utilisé par `POST /api/items`.
 */
export const CreateItemSchema = z.object({
  /** Nom de l'item (obligatoire) */
  name: z.string().min(1, 'Le nom est requis'),
  /** Description optionnelle */
  description: z.string().optional(),
});

/** Type inféré du body de création */
export type CreateItem = z.infer<typeof CreateItemSchema>;

// ─── Mise à jour partielle (PATCH) ─────────────────────────────────────────

/**
 * Schéma de validation pour la mise à jour partielle d'un item.
 * Tous les champs sont optionnels (PATCH sémantique).
 * Utilisé par `PATCH /api/items/:id`.
 */
export const UpdateItemSchema = z.object({
  /** Nouveau nom (optionnel) */
  name: z.string().min(1).optional(),
  /** Nouvelle description (optionnel) */
  description: z.string().optional(),
});

/** Type inféré du body de mise à jour */
export type UpdateItem = z.infer<typeof UpdateItemSchema>;

// ─── Tri et pagination (query params) ───────────────────────────────────────

/**
 * Champs de tri autorisés pour les items.
 * Chaque ressource définit ses propres champs de tri.
 */
export const ItemSortFieldEnum = z.enum(['id', 'name', 'created_at', 'updated_at']);

/** Type inféré des champs de tri */
export type ItemSortField = z.infer<typeof ItemSortFieldEnum>;

/**
 * Schéma de validation des query params HTTP pour le listing des items.
 * Utilisé par `GET /api/items`.
 *
 * Les valeurs numériques sont coercées depuis les query strings.
 */
export const ListItemsQuerySchema = z.object({
  /** Nombre d'éléments par page (coercé depuis string) */
  limit: z.coerce.number().int().positive().optional(),
  /** Numéro de page, commence à 1 (coercé depuis string) */
  page: z.coerce.number().int().positive().optional(),
  /** Champ de tri */
  sortBy: ItemSortFieldEnum.optional(),
  /** Direction du tri (partagée via commonSchema) */
  sortDirection: SortDirectionEnum.optional(),
});

/** Type inféré des query params de listing */
export type ListItemsQuery = z.infer<typeof ListItemsQuerySchema>;
