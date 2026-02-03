import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Student } from '../models/api-response.model';
import { ProgramDto } from '../models/program.model';
import { ServiceResponse } from '../models/service-response.model';

@Injectable({
  providedIn: 'root'
})
export class ProgramService {
  private readonly API_URL = `${environment.apiUrl}/program`;

  constructor(private http: HttpClient) {}

  // ================= CREATE =================
  createProgram(request: ProgramDto): Observable<ServiceResponse<ProgramDto>> {
    return this.http.post<ServiceResponse<ProgramDto>>(this.API_URL, request);
  }

  // ================= GET BY ID =================
  getProgramById(id: number): Observable<ServiceResponse<ProgramDto>> {
    return this.http.get<ServiceResponse<ProgramDto>>(`${this.API_URL}/${id}`);
  }

  // ================= GET ALL =================
  getAllPrograms(): Observable<ServiceResponse<ProgramDto[]>> {
    return this.http.get<ServiceResponse<ProgramDto[]>>(this.API_URL);
  }

  // ================= UPDATE =================
  updateProgram(request: ProgramDto): Observable<ServiceResponse<ProgramDto>> {
    return this.http.put<ServiceResponse<ProgramDto>>(this.API_URL, request);
  }

  // ================= DELETE =================
  deleteProgram(id: number): Observable<ServiceResponse<null>> {
    return this.http.delete<ServiceResponse<null>>(`${this.API_URL}/${id}`);
  }

  
}



