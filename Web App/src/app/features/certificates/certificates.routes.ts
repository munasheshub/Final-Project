import { Routes } from "@angular/router";
import { CertificateListComponent } from "./certificate-list/certificate-list.component";
import { IssueCertificateComponent } from "./certificate-issue/certificate-issue";
import { CertificateRevocationComponent } from "./certificate-revocation/certificate-revocation.component";
import { CertificateVerificationComponent } from "./certificate-verification/certificate-verification.component";
import { VerificationHistoryComponent } from "./verification-history/verification-history.component";
import { AiFlagsComponent } from "./ai-flags/ai-flags.component";
import { AiLogsComponent } from "./ai-logs/ai-logs.component";
import { permissionGuard } from "@/core/guards/permission.guard";
import { Permission } from "@/core/models/user.model";

export default [
    {
        path: '',
        component: CertificateListComponent,
        canActivate: [permissionGuard],
        data: { permissions: [Permission.CERTIFICATE_VIEW] }
    },
    {
        path: 'create',
        component: IssueCertificateComponent,
        canActivate: [permissionGuard],
        data: { permissions: [Permission.CERTIFICATE_CREATE] }
    },
    {
        path: 'revoke',
        component: CertificateRevocationComponent,
        canActivate: [permissionGuard],
        data: { permissions: [Permission.CERTIFICATE_REVOKE] }
    },
    {
        path: 'verify',
        component: CertificateVerificationComponent,
        canActivate: [permissionGuard],
        data: { permissions: [Permission.VERIFY_CERTIFICATE] }
    },
    {
        path: 'verification-history',
        component: VerificationHistoryComponent,
        canActivate: [permissionGuard],
        data: { permissions: [Permission.VIEW_VERIFICATION_HISTORY] }
    },
    {
        path: 'ai-flags',
        component: AiFlagsComponent,
        canActivate: [permissionGuard],
        data: { permissions: [Permission.REVIEW_AI_FLAGS] }
    },
    {
        path: 'ai-logs',
        component: AiLogsComponent,
        canActivate: [permissionGuard],
        data: { permissions: [Permission.VIEW_VERIFICATION_HISTORY] }
    }
] as Routes;