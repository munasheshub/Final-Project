import { Routes } from "@angular/router";
import { UserAccountsComponent } from "./useraccounts/useraccounts";
import { permissionGuard } from "@/core/guards/permission.guard";
import { Permission } from "@/core/models/user.model";

export default [
    {
        path: 'accounts',
        component: UserAccountsComponent,
        canActivate: [permissionGuard],
        data: { permissions: [Permission.USER_VIEW] }
    },
] as Routes;
