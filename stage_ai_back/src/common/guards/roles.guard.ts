import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../constants';

/**
 * Guard de rôles simple (sans JWT complet).
 * Lit le rôle via :
 *  1. Le header `x-user-role` (mode développement / démo)
 *  2. Sinon, erreur 401.
 * Le décorateur @Roles('admin', ...) définit les rôles autorisés.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const role: string | undefined =
      request.headers?.['x-user-role'] ?? request.body?.role ?? request?.user?.role;

    if (!role) {
      throw new UnauthorizedException('Rôle utilisateur manquant');
    }
    if (!requiredRoles.includes(role)) {
      throw new ForbiddenException(`Accès réservé aux rôles : ${requiredRoles.join(', ')}`);
    }
    return true;
  }
}