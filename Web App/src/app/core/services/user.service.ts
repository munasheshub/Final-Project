import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  User,
  UserCreateDto,
  UserUpdateDto,
  UserFilter,
  RegisterDto
} from '../models/user.model';
import { PaginatedResponse } from '../../features/certificates/services/certificate.service';
import { ServiceResponse } from '../models/service-response.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = `${environment.apiUrl}/auth/users`;
  private readonly AUTH_URL = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<ServiceResponse<User[]>> {
    return this.http.get<ServiceResponse<User[]>>(`${this.API_URL}`);
  }

  getUsers(
    page: number = 1,
    pageSize: number = 10,
    filter?: UserFilter
  ): Observable<PaginatedResponse<User>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (filter) {
      if (filter.search) {
        params = params.set('search', filter.search);
      }
      if (filter.role?.length) {
        params = params.set('role', filter.role.join(','));
      }
      if (filter.isActive !== undefined) {
        params = params.set('isActive', filter.isActive.toString());
      }
    }

    return this.http.get<PaginatedResponse<User>>(this.API_URL, { params });
  }

  getUserById(id: string | number): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/${id}`);
  }

  createUser(data: UserCreateDto): Observable<User> {
    return this.http.post<User>(this.API_URL, data);
  }

  createUserAccount(data: RegisterDto): Observable<ServiceResponse<User>> {
    return this.http.post<ServiceResponse<User>>(`${this.AUTH_URL}/create`, data);
  }

  updateUser(id: string | number, data: UserUpdateDto): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/${id}`, data);
  }

  deleteUser(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  resetUserPassword(id: string | number, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${id}/reset-password`, { newPassword });
  }
}
