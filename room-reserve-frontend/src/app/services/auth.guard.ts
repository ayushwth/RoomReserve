import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const requireAuth: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.getToken()) return true;
  return router.createUrlTree(['/login']);
};

export const requireRole = (roles: string[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.getToken()) return router.createUrlTree(['/login']);
  if (roles.includes(auth.getRole())) return true;
  return router.createUrlTree([auth.dashboardForRole()]);
};
