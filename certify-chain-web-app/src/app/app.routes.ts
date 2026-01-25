// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { UserRole, Permission } from './core/models/user.model';
import { permissionGuard } from './core/guards/permissions.guard';
import { AppLayout } from './layout/component/app.layout';
import { LoginComponent } from './features/auth/login/login';
import { DashboardComponent } from './features/dashboard/dashboard.component';

export const routes: Routes = [
  
  
  
  {
    path: '',
    component: AppLayout,
    children: [
      {
        path: '',
        component: DashboardComponent
      },
    ]
  },

  {
  path: 'auth',
  loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
 }
];