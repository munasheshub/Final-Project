import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function handle401Error(
  req: HttpRequest<any>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router
): Observable<HttpEvent<any>> {   // ✅ CRITICAL LINE

  return authService.refreshToken().pipe(
    switchMap(tokens => {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${tokens.accessToken}`
        }
      });

      return next(authReq); // ✅ Observable<HttpEvent<any>>
    }),
    catchError(error => {
      authService.logout();
      router.navigate(['/auth/login']);
      return throwError(() => error);
    })
  );
}