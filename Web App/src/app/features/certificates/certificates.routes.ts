import { Routes } from "@angular/router";
import { CertificateListComponent } from "./certificate-list/certificate-list.component";
import { IssueCertificateComponent } from "./certificate-issue/certificate-issue";

export default [
    { path: '', component: CertificateListComponent },
    { path: 'create', component: IssueCertificateComponent },
] as Routes;