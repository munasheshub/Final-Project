import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FacultyDto, CreateFacultyRequest, UpdateFacultyRequest } from '../models/faculty.model';
import { ServiceResponse } from '../models/service-response.model';

@Injectable({
  providedIn: 'root'
})
export class FacultyService {
  private readonly API_URL = `${environment.apiUrl}/faculties`;

  constructor(private http: HttpClient) {}

  // ================= CREATE =================
  createFaculty(request: CreateFacultyRequest): Observable<ServiceResponse<FacultyDto>> {
    return this.http.post<ServiceResponse<FacultyDto>>(this.API_URL, request);
  }

  // ================= GET BY ID =================
  getFacultyById(id: number): Observable<ServiceResponse<FacultyDto>> {
    return this.http.get<ServiceResponse<FacultyDto>>(`${this.API_URL}/${id}`);
  }

  // ================= GET ALL =================
  getAllFaculties(): Observable<ServiceResponse<FacultyDto[]>> {
    return this.http.get<ServiceResponse<FacultyDto[]>>(this.API_URL);
  }

  // ================= GET BY INSTITUTION =================
  getFacultiesByInstitution(institutionId: number): Observable<ServiceResponse<FacultyDto[]>> {
    return this.http.get<ServiceResponse<FacultyDto[]>>(`${this.API_URL}/institution/${institutionId}`);
  }

  // ================= UPDATE =================
  updateFaculty(id: number, request: UpdateFacultyRequest): Observable<ServiceResponse<FacultyDto>> {
    return this.http.put<ServiceResponse<FacultyDto>>(`${this.API_URL}/${id}`, request);
  }

  // ================= DELETE =================
  deleteFaculty(id: number): Observable<ServiceResponse<boolean>> {
    return this.http.delete<ServiceResponse<boolean>>(`${this.API_URL}/${id}`);
  }
}
