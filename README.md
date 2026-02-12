# Express API Template

Template d'API REST prête à l'emploi basée sur **Express 5**, **TypeScript**, **Zod** et **MySQL**.

---

## Stack technique

| Technologie      | Rôle                                              |
| ---------------- | ------------------------------------------------- |
| **Express 5**    | Framework HTTP                                    |
| **TypeScript**   | Typage statique + path aliases (`@/*`)            |
| **Zod**          | Validation des données (body, query, params, env) |
| **MySQL2**       | Base de données (pool de connexions)              |
| **JWT + bcrypt** | Authentification (Bearer header + cookie)         |
| **Helmet**       | Sécurisation des headers HTTP                     |
| **Morgan**       | Logging des requêtes HTTP (`dev` / `combined`)    |
| **CORS**         | Cross-Origin Resource Sharing                     |
| **TypeDoc**      | Génération de documentation depuis les JSDoc      |

---

## Installation

```bash
# 1. Copier le template dans un nouveau dossier
cp -r template/ mon-projet/
cd mon-projet/

# 2. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# 3. Installer les dépendances
bun install   # ou npm install

# 4. Créer la base de données
mysql -u root -p < schema.sql

# 5. Lancer en développement
bun dev       # ou npm run dev

# 6. Build production
bun run build && bun start

# 7. Générer la documentation (TypeDoc)
bun run docs
# → Ouvre docs/index.html dans un navigateur
```

---

## Architecture

```
src/
├── server.ts                  # Point d'entrée (middlewares, routes, shutdown)
├── config/
│   ├── env.ts                 # Validation Zod des variables d'environnement
│   └── database.ts            # Pool MySQL partagé
├── utils/
│   ├── logger.ts              # Logger structuré [timestamp] [LEVEL] message
│   ├── apiResponse.ts         # successResponse() / errorResponse()
│   └── HttpError.ts           # Classe d'erreur HTTP avec code de statut
├── middleware/
│   ├── authMiddleware.ts      # Authentification JWT (Bearer + cookie)
│   ├── errorMiddleware.ts     # Gestion centralisée des erreurs
│   └── validateMiddleware.ts  # Validation Zod (body, query, params)
├── schemas/
│   ├── commonSchema.ts        # Schémas partagés (IdParamSchema, SortDirection)
│   ├── authSchema.ts          # Schéma de login
│   └── itemSchema.ts          # Schémas CRUD pour la ressource exemple
├── interfaces/
│   └── repositories.ts        # Contrats des repositories (pour tests/mocks)
├── repositories/
│   └── itemRepository.ts      # Requêtes SQL paramétrées
├── services/
│   └── itemService.ts         # Logique métier + pagination
├── controllers/
│   ├── authController.ts      # Handler login (bcrypt + JWT)
│   └── itemController.ts      # Handlers CRUD
└── routes/
    ├── apiRoutes.ts            # Routeur principal /api (agrège tout)
    ├── authRoutes.ts           # POST /api/auth/login
    └── itemRoutes.ts           # CRUD /api/items
```

---

## Conventions

### Flux d'une requête

```
Client → Helmet → CORS → Morgan → JSON parser → Cookie parser
       → Route → [authMiddleware] → validateMiddleware → controller
       → Service → Repository → MySQL
       → successResponse / errorResponse → Client
```

### Ajouter une nouvelle ressource

Pour ajouter une ressource (ex: `users`), créer les fichiers suivants en s'inspirant de l'exemple `items` :

1. **`schemas/userSchema.ts`** — Schémas Zod (Create, Update, Query, DB type)
2. **`repositories/userRepository.ts`** — Requêtes SQL paramétrées
3. **`interfaces/repositories.ts`** — Ajouter `IUserRepository`
4. **`services/userService.ts`** — Logique métier
5. **`controllers/userController.ts`** — Handlers Express
6. **`routes/userRoutes.ts`** — Routes Express
7. **`routes/apiRoutes.ts`** — Monter le routeur : `apiRouter.use('/users', authMiddleware, userRoutes)`
8. **`schema.sql`** — Ajouter la table SQL

### Gestion des erreurs

| Source                            | HTTP               | Gestion                                           |
| --------------------------------- | ------------------ | ------------------------------------------------- |
| `throw new HttpError(404, 'msg')` | 404 (ou tout code) | `errorMiddleware` → JSON                          |
| `ZodError` (validation)           | 400                | `errorMiddleware` → JSON + détails                |
| `JsonWebTokenError`               | 401                | `errorMiddleware` → JSON                          |
| `TokenExpiredError`               | 401                | `errorMiddleware` → JSON                          |
| Erreur non gérée                  | 500                | `errorMiddleware` → JSON (message masqué en prod) |
| Route inconnue                    | 404                | Handler 404 dans `server.ts`                      |

### Format des réponses API

```json
// Succès
{ "success": true, "data": [...], "pagination": { ... } }

// Erreur
{ "success": false, "error": "Message d'erreur", "details": [...] }
```

### Validation des données

Utiliser les middlewares de validation dans les routes :

```typescript
router.post("/", validateBody(CreateSchema), createHandler);
router.get("/", validateQuery(ListQuerySchema), listHandler);
router.delete("/:id", validateParams(IdParamSchema), deleteHandler);
```

> **Note** : Express 5 propage automatiquement les rejets de Promise des handlers async
> vers le middleware d'erreur.

Les schémas partagés (`IdParamSchema`, `SortDirectionEnum`) sont dans `schemas/commonSchema.ts`.

### Pagination

La pagination est gérée dans le service via les variables d'environnement :

- `DEFAULT_PAGE_LIMIT` — Nombre d'éléments par page par défaut (10)
- `MAX_PAGE_LIMIT` — Limite maximale autorisée (100)

Query params : `?page=1&limit=20&sortBy=created_at&sortDirection=desc`

---

## Variables d'environnement

| Variable             | Requis | Défaut        | Description                                             |
| -------------------- | :----: | ------------- | ------------------------------------------------------- |
| `NODE_ENV`           |  Non   | `development` | `development` / `production` / `test`                   |
| `PORT`               |  Non   | `3000`        | Port du serveur HTTP                                    |
| `DB_HOST`            |  Oui   | —             | Hôte MySQL                                              |
| `DB_PORT`            |  Non   | `3306`        | Port MySQL                                              |
| `DB_USER`            |  Oui   | —             | Utilisateur MySQL                                       |
| `DB_PASSWORD`        |  Oui   | —             | Mot de passe MySQL                                      |
| `DB_NAME`            |  Oui   | —             | Nom de la base de données                               |
| `DB_POOL_SIZE`       |  Non   | `10`          | Connexions max dans le pool                             |
| `JWT_SECRET`         |  Oui   | —             | Clé secrète pour signer les JWT                         |
| `PASSWORD_HASH`      |  Oui   | —             | Hash bcrypt du mot de passe admin                       |
| `JWT_EXPIRY`         |  Non   | `86400`       | Durée de vie des JWT (secondes)                         |
| `CORS_ORIGIN`        |  Non   | `*` (toutes)  | Origine(s) CORS autorisée(s), séparées par des virgules |
| `DEFAULT_PAGE_LIMIT` |  Non   | `10`          | Pagination par défaut                                   |
| `MAX_PAGE_LIMIT`     |  Non   | `100`         | Pagination maximale                                     |

Toutes les variables sont validées au démarrage via Zod. Si une variable requise manque, le serveur refuse de démarrer avec un message explicite.

---

## Sécurité

- **Helmet** : headers HTTP sécurisés (X-Content-Type-Options, X-Frame-Options, etc.)
- **CORS** : configurable via `CORS_ORIGIN` (ouvert en dev, restreint en prod)
- **JWT** : tokens signés avec expiration configurable
- **bcrypt** : hashage des mots de passe
- **Cookies HttpOnly** : `secure` en production, `sameSite: strict`
- **SQL paramétré** : toutes les requêtes utilisent des placeholders `?`
- **Validation Zod** : toute entrée est validée avant traitement
- **Whitelist tri** : les champs de tri sont filtrés contre une liste autorisée
- **Erreurs masquées** : en production, les erreurs 500 ne révèlent pas de détails
- **Graceful shutdown** : timeout de 10s pour éviter les processus suspendus

---

## Endpoints

### Authentification (publique)

| Méthode | Route             | Description                 |
| ------- | ----------------- | --------------------------- |
| `POST`  | `/api/auth/login` | Connexion (retourne un JWT) |

### Items (authentifié)

| Méthode  | Route            | Description                |
| -------- | ---------------- | -------------------------- |
| `GET`    | `/api/items`     | Lister (paginé, triable)   |
| `GET`    | `/api/items/:id` | Détail                     |
| `POST`   | `/api/items`     | Créer                      |
| `PATCH`  | `/api/items/:id` | Modifier (partiel)         |
| `DELETE` | `/api/items/:id` | Supprimer (204 No Content) |

### Supervision

| Méthode | Route     | Description                                  |
| ------- | --------- | -------------------------------------------- |
| `GET`   | `/health` | Health check (vérifie la connectivité MySQL) |

---

## Documentation JSDoc

Tous les fichiers sources sont documentés avec des JSDoc standards incluant :

- `@module` + `@description` sur chaque fichier
- `@param`, `@returns`, `@throws` sur chaque fonction/méthode exportée
- `@example` avec des exemples d'utilisation concrets
- Commentaires inline (`/** ... */`) sur les champs des schémas Zod et interfaces

### Générer la documentation

```bash
bun run docs
```

La documentation HTML est générée dans le dossier `docs/` via **TypeDoc** (configuré dans `typedoc.json`).

### Conventions JSDoc à suivre

Lors de l'ajout d'une nouvelle ressource, respecter ce pattern :

````typescript
/**
 * @module services/monService
 * @description Logique métier pour la ressource "mon-resource".
 *
 * Description détaillée du module.
 *
 * @example
 * ```ts
 * import * as monService from '@/services/monService.js';
 * const result = await monService.list();
 * ```
 */

/**
 * Description de la fonction.
 *
 * @param id - Description du paramètre
 * @returns Description du retour
 * @throws {HttpError} 404 si la ressource n'existe pas
 */
export async function get(id: number) { ... }
````
