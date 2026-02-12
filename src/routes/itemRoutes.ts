/**
 * @module routes/itemRoutes
 * @description Routes CRUD pour la ressource "items".
 *
 * | Méthode | Route              | Validation              | Description          |
 * |---------|--------------------|-------------------------|----------------------|
 * | GET     | `/api/items`       | `ListItemsQuerySchema`  | Lister (paginé)      |
 * | GET     | `/api/items/:id`   | `IdParamSchema`         | Détail               |
 * | POST    | `/api/items`       | `CreateItemSchema`      | Créer                |
 * | PATCH   | `/api/items/:id`   | `UpdateItemSchema`      | Modifier (partiel)   |
 * | DELETE  | `/api/items/:id`   | `IdParamSchema`         | Supprimer            |
 */
import express from 'express';

import {
  createItemHandler,
  deleteItemHandler,
  getItemHandler,
  listItemsHandler,
  updateItemHandler,
} from '@/controllers/itemController.js';
import { validateBody, validateParams, validateQuery } from '@/middleware/validateMiddleware.js';
import { IdParamSchema } from '@/schemas/commonSchema.js';
import { CreateItemSchema, ListItemsQuerySchema, UpdateItemSchema } from '@/schemas/itemSchema.js';

const router = express.Router();

router.get('/', validateQuery(ListItemsQuerySchema), listItemsHandler);
router.get('/:id', validateParams(IdParamSchema), getItemHandler);
router.post('/', validateBody(CreateItemSchema), createItemHandler);
router.patch('/:id', validateParams(IdParamSchema), validateBody(UpdateItemSchema), updateItemHandler);
router.delete('/:id', validateParams(IdParamSchema), deleteItemHandler);

export default router;
