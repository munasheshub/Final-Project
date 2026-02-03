
// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { environment } from '../../../environments/environment';
// import { InstitutionProfile } from '../../features/settings/institution-profile/institution-profile.component';

// @Injectable({
//   providedIn: 'root'
// })
// export class InstitutionService {
//   private readonly API_URL = `${environment.apiUrl}/institution`;

//   constructor(private http: HttpClient) {}

//   getInstitutionProfile(): Observable<InstitutionProfile> {
//     return this.http.get<InstitutionProfile>(`${this.API_URL}/profile`);
//   }

//   updateInstitutionProfile(formData: FormData): Observable<InstitutionProfile> {
//     return this.http.put<InstitutionProfile>(`${this.API_URL}/profile`, formData);
//   }

//   updateInstitutionBranding(formData: FormData): Observable<InstitutionProfile> {
//     return this.http.put<InstitutionProfile>(`${this.API_URL}/branding`, formData);
//   }
// }
