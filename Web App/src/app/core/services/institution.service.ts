import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InstitutionDto, CreateInstitutionRequest, UpdateInstitutionRequest } from '../models/institution.model';
import { ServiceResponse } from '../models/service-response.model';

@Injectable({
  providedIn: 'root'
})
export class InstitutionService {
  private readonly API_URL = `${environment.apiUrl}/institution`;

  constructor(private http: HttpClient) {}

  getAllInstitutions(): Observable<ServiceResponse<InstitutionDto[]>> {
    return this.http.get<ServiceResponse<InstitutionDto[]>>(this.API_URL);
  }

  getInstitutionById(id: number): Observable<ServiceResponse<InstitutionDto>> {
    return this.http.get<ServiceResponse<InstitutionDto>>(`${this.API_URL}/${id}`);
  }

  getMyInstitution(): Observable<ServiceResponse<InstitutionDto>> {
    return this.http.get<ServiceResponse<InstitutionDto>>(`${this.API_URL}/mine`);
  }

  createInstitution(request: CreateInstitutionRequest): Observable<ServiceResponse<InstitutionDto>> {
    request.tenantId = ""
    return this.http.post<ServiceResponse<InstitutionDto>>(this.API_URL, request);
  }

  updateInstitution(request: UpdateInstitutionRequest): Observable<ServiceResponse<InstitutionDto>> {
    request.tenantId = ""
    return this.http.put<ServiceResponse<InstitutionDto>>(this.API_URL, request);
  }

  deleteInstitution(id: number): Observable<ServiceResponse<void>> {
    return this.http.delete<ServiceResponse<void>>(`${this.API_URL}/${id}`);
  }
}
