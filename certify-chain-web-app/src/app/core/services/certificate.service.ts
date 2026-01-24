// src/app/features/certificates/services/certificate.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Certificate } from 'crypto';
import { 
    CertificateFilter, 
    CertificateCreateDto, 
    CertificateRevocationDto, 
    CertificateBatchUpload, CertificateStats } from '../models/api-response.model';

import { environment } from '../../../environments/environment'

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class CertificateService {
  private readonly API_URL = `${environment.apiUrl}/certificates`;

  constructor(private http: HttpClient) {}

  /**
   * Get paginated list of certificates with filters
   */
  getCertificates(
    page: number = 1,
    pageSize: number = 10,
    filter?: CertificateFilter
  ): Observable<PaginatedResponse<Certificate>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (filter) {
      if (filter.search) {
        params = params.set('search', filter.search);
      }
      if (filter.status?.length) {
        params = params.set('status', filter.status.join(','));
      }
      if (filter.qualificationType?.length) {
        params = params.set('qualificationType', filter.qualificationType.join(','));
      }
      if (filter.dateFrom) {
        params = params.set('dateFrom', filter.dateFrom.toISOString());
      }
      if (filter.dateTo) {
        params = params.set('dateTo', filter.dateTo.toISOString());
      }
      if (filter.studentId) {
        params = params.set('studentId', filter.studentId);
      }
      if (filter.isRevoked !== undefined) {
        params = params.set('isRevoked', filter.isRevoked.toString());
      }
    }

    return this.http.get<PaginatedResponse<Certificate>>(this.API_URL, { params });
  }

  /**
   * Get certificate by ID
   */
  getCertificateById(id: string): Observable<Certificate> {
    return this.http.get<Certificate>(`${this.API_URL}/${id}`);
  }

  /**
   * Get certificate by certificate number
   */
  getCertificateByCertificateNumber(certificateNumber: string): Observable<Certificate> {
    return this.http.get<Certificate>(`${this.API_URL}/number/${certificateNumber}`);
  }

  /**
   * Create new certificate
   */
  createCertificate(data: CertificateCreateDto): Observable<Certificate> {
    const formData = this.buildFormData(data);
    return this.http.post<Certificate>(this.API_URL, formData);
  }

  /**
   * Update certificate (limited fields)
   */
  updateCertificate(id: string, data: Partial<Certificate>): Observable<Certificate> {
    return this.http.put<Certificate>(`${this.API_URL}/${id}`, data);
  }

  /**
   * Revoke certificate
   */
  revokeCertificate(data: CertificateRevocationDto): Observable<Certificate> {
    return this.http.post<Certificate>(`${this.API_URL}/revoke`, data);
  }

  /**
   * Batch upload certificates
   */
  batchUploadCertificates(file: File): Observable<CertificateBatchUpload> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<CertificateBatchUpload>(`${this.API_URL}/batch-upload`, formData);
  }

  /**
   * Download batch upload template
   */
  downloadBatchTemplate(): Observable<Blob> {
    return this.http.get(`${this.API_URL}/batch-upload/template`, {
      responseType: 'blob'
    });
  }

  /**
   * Verify certificate by verification code
   */
  verifyCertificate(verificationCode: string): Observable<Certificate> {
    return this.http.post<Certificate>(`${this.API_URL}/verify`, { verificationCode });
  }

  /**
   * Run AI fraud detection on certificate
   */
  runFraudDetection(certificateId: string): Observable<{
    score: number;
    result: 'AUTHENTIC' | 'SUSPICIOUS' | 'FRAUDULENT';
    details: any;
  }> {
    return this.http.post<any>(`${this.API_URL}/${certificateId}/fraud-detection`, {});
  }

  /**
   * Get certificate statistics
   */
  getCertificateStats(dateFrom?: Date, dateTo?: Date): Observable<CertificateStats> {
    let params = new HttpParams();
    if (dateFrom) {
      params = params.set('dateFrom', dateFrom.toISOString());
    }
    if (dateTo) {
      params = params.set('dateTo', dateTo.toISOString());
    }
    return this.http.get<CertificateStats>(`${this.API_URL}/stats`, { params });
  }

  /**
   * Download certificate PDF
   */
  downloadCertificate(certificateId: string): Observable<Blob> {
    return this.http.get(`${this.API_URL}/${certificateId}/download`, {
      responseType: 'blob'
    });
  }

  /**
   * Get certificate QR code
   */
  getCertificateQRCode(certificateId: string): Observable<Blob> {
    return this.http.get(`${this.API_URL}/${certificateId}/qr-code`, {
      responseType: 'blob'
    });
  }

  /**
   * Build FormData from CertificateCreateDto
   */
  private buildFormData(data: CertificateCreateDto): FormData {
    const formData = new FormData();
    
    formData.append('studentId', data.studentId);
    formData.append('qualificationType', data.qualificationType);
    formData.append('programName', data.programName);
    if (data.specialization) {
      formData.append('specialization', data.specialization);
    }
    formData.append('awardClass', data.awardClass);
    formData.append('graduationDate', data.graduationDate.toISOString());
    formData.append('documentFile', data.documentFile);
    formData.append('signatureId', data.signatureId);
    if (data.performFraudCheck !== undefined) {
      formData.append('performFraudCheck', data.performFraudCheck.toString());
    }

    return formData;
  }
}