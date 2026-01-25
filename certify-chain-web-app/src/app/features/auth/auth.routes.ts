// src/app/features/auth/auth.routes.ts

import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login')
      .then(m => m.LoginComponent),
    data: { 
      title: 'Login',
      hideLayout: true 
    }
  },
  {
    path: '2fa',
    loadComponent: () => import('./two-factor/two-factor')
      .then(m => m.TwoFactorComponent),
    data: { 
      title: 'Two-Factor Authentication',
      hideLayout: true 
    }
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./forgot-password/forgot-password')
      .then(m => m.ForgotPasswordComponent),
    data: { 
      title: 'Forgot Password',
      hideLayout: true 
    }
  },
//   {
//     path: 'reset-password',
//     loadComponent: () => import('./reset-password/reset-password.component')
//       .then(m => m.ResetPasswordComponent),
//     data: { 
//       title: 'Reset Password',
//       hideLayout: true 
//     }
//   }
  
];