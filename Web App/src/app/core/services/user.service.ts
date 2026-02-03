import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  User,
  UserCreateDto,
  UserUpdateDto,
  UserFilter
} from '../models/user.model';
import { PaginatedResponse } from '../../features/certificates/services/certificate.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

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

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/${id}`);
  }

  createUser(data: UserCreateDto): Observable<User> {
    return this.http.post<User>(this.API_URL, data);
  }

  updateUser(id: string, data: UserUpdateDto): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/${id}`, data);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  resetUserPassword(id: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${id}/reset-password`, { newPassword });
  }
}
