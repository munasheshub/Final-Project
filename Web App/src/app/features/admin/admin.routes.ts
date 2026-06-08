import { Routes } from '@angular/router';
import { roleGuard } from '@/core/guards/role.guard';
import { UserRole } from '@/core/models/user.model';

const routes: Routes = [
    {
        path: 'gas-costs',
        loadComponent: () => import('./gas-costs/gas-costs.component').then(m => m.GasCostsComponent),
        canActivate: [roleGuard],
        data: { roles: [UserRole.SuperAdmin] }
    }
];

export default routes;
