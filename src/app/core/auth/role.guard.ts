import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Role } from '../models';

/** Rota inicial de cada papel — usada por role.guard.ts e pelo redirecionamento pós-login. */
export function rotaInicialPorRole(role: Role): string {
  switch (role) {
    case 'cliente':
      return '/portal/meus-processos';
    case 'advogado':
    case 'estagiario':
      return '/dashboard';
  }
}

/** Factory de guard: `roleGuard(['advogado', 'estagiario'])` restringe a rota a esses papéis. */
export function roleGuard(rolesPermitidas: Role[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const role = authService.role();
    if (!role) return router.createUrlTree(['/login']);
    if (rolesPermitidas.includes(role)) return true;

    return router.createUrlTree([rotaInicialPorRole(role)]);
  };
}
