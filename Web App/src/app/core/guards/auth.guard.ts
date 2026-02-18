
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { map, take, catchError, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    switchMap(isAuthenticated => {
      if (isAuthenticated) {
        return of(true);
      }
      
      // Try to refresh token if refresh token exists
      const refreshToken = authService.getRefreshToken();
      if (refreshToken) {
        return authService.refreshToken().pipe(
          map(() => true),
          catchError(() => {
            // Refresh failed, redirect to login
            return of(router.createUrlTree(['/auth/login'], {
              queryParams: { returnUrl: state.url }
            }));
          })
        );
      }
      
      // No refresh token, redirect to login
      return of(router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      }));
    })
  );
};

