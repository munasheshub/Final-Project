import { Routes } from "@angular/router";
import { CertificateListComponent } from "./certificate-list/certificate-list.component";
import { IssueCertificateComponent } from "./certificate-issue/certificate-issue";
import { CertificateRevocationComponent } from "./certificate-revocation/certificate-revocation.component";

export default [
    { path: '', component: CertificateListComponent },
    { path: 'create', component: IssueCertificateComponent },
    { path: 'revoke', component: CertificateRevocationComponent },
] as Routes;