import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { DashboardComponent } from '@/features/dashboard/dashboard.component';
import { authGuard } from '@/core/guards/auth.guard';
import { CertificateVerificationComponent } from '@/features/public/certificate-verification/certificate-verification.component';

export const appRoutes: Routes = [
    {
        path: '',
        canActivate: [authGuard],
        component: AppLayout,
        children: [
            { path: '', component: DashboardComponent },
            { path: 'certificates', loadChildren: () => import('@/features/certificates/certificates.routes').then(m => m.default) },
            { path: 'settings', loadChildren: () => import('@/features/settings/settings.routes').then(m => m.default) },
            { path: 'users', loadChildren: () => import('@/features/users/users.routes').then(m => m.default) }
        ]
    },
    
    { path: 'landing', component: Landing },
    { path: 'verify', component: CertificateVerificationComponent },
    { path: 'auth', loadChildren: () => import('@/features/auth/auth.routes').then(m => m.default) },
    { path: '**', redirectTo: '/notfound' }
];
