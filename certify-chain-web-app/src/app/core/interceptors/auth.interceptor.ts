// // src/app/core/interceptors/auth.interceptor.ts

// import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { Router } from '@angular/router';
// import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';
// import { AuthService } from '../services/auth.service';

// let isRefreshing = false;
// const refreshTokenSubject = new BehaviorSubject<string | null>(null);

// export const authInterceptor: HttpInterceptorFn = (req, next) => {
//   const authService = inject(AuthService);
//   const router = inject(Router);
  
//   // Add auth token to request
//   const token = authService.getAccessToken();
  
//   if (token) {
//     req = req.clone({
//       setHeaders: {
//         Authorization: `Bearer ${token}`
//       }
//     });
//   }

//   return next(req).pipe(
//     catchError((error: HttpErrorResponse) => {
//       if (error.status === 401) {
//         return handle401Error(req, next, authService, router);
//       }
//       return throwError(() => error);
//     })
//   );
// };

// function handle401Error(
//   request: any, 
//   next: any, 
//   authService: AuthService,
//   router: Router
// ) {
//   if (!isRefreshing) {
//     isRefreshing = true;
//     refreshTokenSubject.next(null);

//     return authService.refreshToken().pipe(
//       switchMap((tokens: any) => {
//         isRefreshing = false;
//         refreshTokenSubject.next(tokens.accessToken);
        
//         return next(request.clone({
//           setHeaders: {
//             Authorization: `Bearer ${tokens.accessToken}`
//           }
//         }));
//       }),
//       catchError((err) => {
//         isRefreshing = false;
//         authService.logout();
//         return throwError(() => err);
//       })
//     );
//   } else {
//     return refreshTokenSubject.pipe(
//       filter(token => token != null),
//       take(1),
//       switchMap(token => {
//         return next(request.clone({
//           setHeaders: {
//             Authorization: `Bearer ${token}`
//           }
//         }));
//       })
//     );
//   }
// }

