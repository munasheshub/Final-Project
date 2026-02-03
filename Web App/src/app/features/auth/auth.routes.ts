import { Routes } from '@angular/router';
import { Access } from './access';
import { Login } from './login';
import { Error } from './error';

export default [
    { path: 'access', component: Access },
    { path: 'error', component: Error },
    { path: 'login', component: Login },
    { path: 'forgot-password', loadComponent: () => import('./forgot-password').then(m => m.ForgotPassword) },
    { path: 'reset-password', loadComponent: () => import('./reset-password').then(m => m.ResetPassword) },
] as Routes;