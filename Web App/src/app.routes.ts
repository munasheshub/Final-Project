import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { DashboardComponent } from '@/features/dashboard/dashboard.component';
import { authGuard } from '@/core/guards/auth.guard';
import { permissionGuard } from '@/core/guards/permission.guard';
import { Permission } from '@/core/models/user.model';

export const appRoutes: Routes = [
    {
        path: '',
        canActivate: [authGuard],
        component: AppLayout,
        children: [
            {
                path: '',
                component: DashboardComponent,
                canActivate: [permissionGuard],
                data: { permissions: [Permission.DASHBOARD_VIEW] }
            },
            { path: 'certificates', loadChildren: () => import('@/features/certificates/certificates.routes').then(m => m.default) },
            { path: 'settings', loadChildren: () => import('@/features/settings/settings.routes').then(m => m.default) },
            { path: 'users', loadChildren: () => import('@/features/users/users.routes').then(m => m.default) },
            { path: 'admin', loadChildren: () => import('@/features/admin/admin.routes').then(m => m.default) }
        ]
    },
    
    { path: 'landing', component: Landing },
    { path: 'auth', loadChildren: () => import('@/features/auth/auth.routes').then(m => m.default) },
    { path: 'notfound', loadComponent: () => import('@/features/auth/error').then(m => m.Error) },
    { path: 'unauthorized', loadComponent: () => import('@/features/auth/access').then(m => m.Access) },
    { path: '**', redirectTo: '/notfound' }
];
