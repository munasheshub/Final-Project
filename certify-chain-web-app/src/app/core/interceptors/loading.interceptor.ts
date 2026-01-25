
// import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { tap, finalize } from 'rxjs';
// import { LoadingService } from '../services/loading.service';

// let totalRequests = 0;

// export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
//   const loadingService = inject(LoadingService);
  
//   totalRequests++;
//   loadingService.show();

//   return next(req).pipe(
//     tap((event) => {
//       if (event instanceof HttpResponse) {
//         // Request completed successfully
//       }
//     }),
//     finalize(() => {
//       totalRequests--;
//       if (totalRequests === 0) {
//         loadingService.hide();
//       }
//     })
//   );
// };