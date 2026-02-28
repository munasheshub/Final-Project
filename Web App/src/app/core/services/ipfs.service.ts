import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Student } from '../models/api-response.model';
import { ServiceResponse } from '../models/service-response.model';

@Injectable({
  providedIn: 'root'
})
export class IpfsService {
  private readonly API_URL = `${environment.apiUrl}/ipfs`;

  constructor(private http: HttpClient) {}

   uploadToIPFS(file: File): Observable<ServiceResponse<string>>{
    const formData = new FormData();
    formData.append('CertificateFile', file);
    formData.append('FileName', file.name);
    return this.http.post<ServiceResponse<string>>(`${this.API_URL}/upload`, formData);
   }

   downloadFromIPFS(cid: string): Observable<Blob> {
    return this.http.get(`${this.API_URL}/download/${cid}`, { 
      responseType: 'blob' 
    });
   }

  
}



