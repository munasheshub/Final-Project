import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Student } from '../models/api-response.model';
import { ServiceResponse } from '../models/service-response.model';
import { CreateStudentRequest, UpdateStudentRequest } from '../models/student.model';



@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private readonly API_URL = `${environment.apiUrl}/students`;

  constructor(private http: HttpClient) {}

  // ================= CREATE =================
  createStudent(request: CreateStudentRequest): Observable<ServiceResponse<Student>> {
    return this.http.post<ServiceResponse<Student>>(this.API_URL, request);
  }

  // ================= GET BY ID =================
  getStudentById(id: number): Observable<ServiceResponse<Student>> {
    return this.http.get<ServiceResponse<Student>>(`${this.API_URL}/${id}`);
  }

  // ================= GET ALL =================
  getAllStudents(): Observable<ServiceResponse<Student[]>> {
    return this.http.get<ServiceResponse<Student[]>>(this.API_URL);
  }

  // ================= UPDATE =================
  updateStudent(request: UpdateStudentRequest): Observable<ServiceResponse<Student>> {
    return this.http.put<ServiceResponse<Student>>(this.API_URL, request);
  }

  // ================= DELETE =================
  deleteStudent(id: number): Observable<ServiceResponse<null>> {
    return this.http.delete<ServiceResponse<null>>(`${this.API_URL}/${id}`);
  }

  // ================= GET BY STUDENT NUMBER =================
  getStudentByNumber(studentNumber: string): Observable<ServiceResponse<Student>> {
    return this.http.get<ServiceResponse<Student>>(`${this.API_URL}/by-number/${studentNumber}`);
  }

  // ================= BULK UPLOAD =================
  bulkUpload(file: File): Observable<ServiceResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ServiceResponse<any>>(`${this.API_URL}/bulk-upload`, formData);
  }

  // ================= LEGACY METHODS (for backward compatibility) =================
  searchStudents(searchText: string): Observable<Student[]> {
    const params = new HttpParams().set('search', searchText);
    return this.http.get<Student[]>(`${this.API_URL}/search`, { params });
  }

  getStudentByStudentId(studentId: string): Observable<Student> {
    return this.http.get<Student>(`${this.API_URL}/student-id/${studentId}`);
  }
}





