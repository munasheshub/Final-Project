import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ServiceResponse } from '../../../core/models/service-response.model';

export interface CreateVerificationLogRequest {
  certificateHash: string;
  isSuccess: boolean;
  failureReason?: string;
}

export interface GetVerificationLogsRequest {
  certificateHash?: string;
  certificateId?: number;
  isSuccess?: boolean;
  fromDate?: string;
  toDate?: string;
  ipAddress?: string;
}

export interface VerificationLogResponseDto {
  id: string;
  tenantId: string;
  certificateHash: string;
  certificateId: number;
  verifiedAt: string;
  verifiedBy?: string;
  isSuccess: boolean;
  failureReason?: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VerificationLogService {
  private readonly API_URL = `${environment.apiUrl}/verification-logs`;

  constructor(private http: HttpClient) {}

  createVerificationLog(request: CreateVerificationLogRequest): Observable<ServiceResponse<VerificationLogResponseDto>> {
    return this.http.post<ServiceResponse<VerificationLogResponseDto>>(this.API_URL, request);
  }

  getVerificationLogs(request: GetVerificationLogsRequest = {}): Observable<ServiceResponse<VerificationLogResponseDto[]>> {
    let params = new HttpParams();

    if (request.certificateHash) {
      params = params.set('CertificateHash', request.certificateHash);
    }

    if (request.certificateId !== undefined) {
      params = params.set('CertificateId', request.certificateId.toString());
    }

    if (request.isSuccess !== undefined) {
      params = params.set('IsSuccess', request.isSuccess.toString());
    }

    if (request.fromDate) {
      params = params.set('FromDate', request.fromDate);
    }

    if (request.toDate) {
      params = params.set('ToDate', request.toDate);
    }

    if (request.ipAddress) {
      params = params.set('IpAddress', request.ipAddress);
    }

    return this.http.get<ServiceResponse<VerificationLogResponseDto[]>>(this.API_URL, { params });
  }

  getByCertificateHash(certificateHash: string): Observable<ServiceResponse<VerificationLogResponseDto[]>> {
    return this.http.get<ServiceResponse<VerificationLogResponseDto[]>>(`${this.API_URL}/by-hash/${encodeURIComponent(certificateHash)}`);
  }

  getByCertificateId(certificateId: number): Observable<ServiceResponse<VerificationLogResponseDto[]>> {
    return this.http.get<ServiceResponse<VerificationLogResponseDto[]>>(`${this.API_URL}/by-certificate/${certificateId}`);
  }

  getMyVerificationLogs(): Observable<ServiceResponse<VerificationLogResponseDto[]>> {
    return this.http.get<ServiceResponse<VerificationLogResponseDto[]>>(`${this.API_URL}/mine`);
  }
}
