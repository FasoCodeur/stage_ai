 import { join } from 'path';

/**
 * Dossier de stockage des fichiers téléversés.
 * Toujours résolu depuis la racine du backend (là où sont exécutés les scripts npm),
 * ce qui évite toute dépendance au répertoire courant de l'appelant.
 */
export const UPLOADS_DIR = join(process.cwd(), 'uploads');

/** Préfixe d'URL publique des fichiers téléversés. */
export const UPLOADS_URL_PREFIX = '/uploads/';
