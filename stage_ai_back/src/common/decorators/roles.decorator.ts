import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../constants';

/**
 * Décorateur @Roles('admin', 'tuteur', ...) pour définir les rôles autorisés.
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);