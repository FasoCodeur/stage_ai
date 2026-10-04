/**
 * Point d'entrée du backend pour Vercel (« Deploy a Node.js server » — zéro configuration).
 *
 * Vercel exécute ce fichier, détecte l'appel app.listen() fait par NestJS au démarrage,
 * et route toutes les requêtes vers ce serveur via un port interne.
 * En local, `node server.js` démarre l'API exactement comme `npm run start:prod`.
 */

// Métadonnées des décorateurs (requis par NestJS et TypeORM)
require('reflect-metadata');

// Force l'inclusion du driver PostgreSQL dans le bundle serverless Vercel :
// TypeORM le charge dynamiquement (PlatformTools.load), la détection de
// dépendances de Vercel pourrait sinon l'omettre.
require('pg');

// Démarre l'application NestJS compilée (dist/main.js appelle app.listen).
require('./dist/main.js');
