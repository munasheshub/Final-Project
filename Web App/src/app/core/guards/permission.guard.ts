

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Permission } from '../models/user.model';

export const permissionGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredPermissions = route.data['permissions'] as Permission[];

  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  const hasPermission = authService.hasAllPermissions(requiredPermissions);

  if (hasPermission) {
    return true;
  }

  // User doesn't have required permissions
  return router.createUrlTree(['/unauthorized']);
};