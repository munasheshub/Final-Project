import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Student } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private readonly API_URL = `${environment.apiUrl}/students`;

  constructor(private http: HttpClient) {}

  searchStudents(searchText: string): Observable<Student[]> {
    const params = new HttpParams().set('search', searchText);
    return this.http.get<Student[]>(`${this.API_URL}/search`, { params });
  }

  getStudentById(id: string): Observable<Student> {
    return this.http.get<Student>(`${this.API_URL}/${id}`);
  }

  getStudentByStudentId(studentId: string): Observable<Student> {
    return this.http.get<Student>(`${this.API_URL}/student-id/${studentId}`);
  }
}



