
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const allowedRoles = route.data['roles'] as UserRole[];

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      if (!user) {
        return router.createUrlTree(['/auth/login']);
      }

      if (!allowedRoles || allowedRoles.includes(user.role)) {
        return true;
      }

      // User doesn't have required role
      return router.createUrlTree(['/unauthorized']);
    })
  );
};
