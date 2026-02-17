// src/app/features/certificates/services/certificate.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CertificateFilter, CertificateCreateDto, CertificateRevocationDto, CertificateBatchUpload, CertificateStats, Certificate } from '../../../core/models/api-response.model';


export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BlockchainCertificateIssueDto {
  // Student Information
  studentId: string;
  fullName: string;
  dateOfBirth: string;
  email?: string;
  phoneNumber?: string;
  
  // Certificate Details
  programName: string;
  specialization?: string;
  qualificationType: string;
  awardClass: string;
  graduationDate: string;
  certificateNumber?: string;
  
  // Document Information
  fileHash: string;
  
  // Blockchain Data
  transactionHash: string;
  certHash: string;
  ipfsCID: string;
  walletAddress: string;
  gasUsed?: string;
  blockNumber?: number;
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
   * Issue certificate with blockchain integration
   * Submits certificate data to backend after blockchain registration
   */
  issueCertificateWithBlockchain(data: BlockchainCertificateIssueDto): Observable<any> {
    const payload = {
      // Student information
      studentId: data.studentId,
      fullName: data.fullName,
      dateOfBirth: data.dateOfBirth,
      email: data.email,
      phoneNumber: data.phoneNumber,
      
      // Certificate details
      programName: data.programName,
      specialization: data.specialization,
      qualificationType: data.qualificationType,
      awardClass: data.awardClass,
      graduationDate: data.graduationDate,
      certificateNumber: data.certificateNumber,
      
      // Document information
      fileHash: data.fileHash,
      
      // Blockchain data
      transactionHash: data.transactionHash,
      certHash: data.certHash,
      ipfsCID: data.ipfsCID,
      walletAddress: data.walletAddress,
      gasUsed: data.gasUsed,
      blockNumber: data.blockNumber
    };
    
    return this.http.post(`${this.API_URL}/issue`, payload);
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

  /**
   * Generate dummy certificates for testing or development
   */
  getDummyCertificates(count: number = 10): Observable<PaginatedResponse<Certificate>> {
    const statuses = ['ACTIVE', 'REVOKED', 'EXPIRED'];
    const qualificationTypes = ['Bachelor', 'Master', 'PhD', 'Diploma'];
    const awardClasses = ['First Class', 'Second Class Upper', 'Second Class Lower', 'Third Class'];
    const programNames = ['Computer Science', 'Business Administration', 'Mechanical Engineering', 'Psychology'];
    const specializations = ['Artificial Intelligence', 'Marketing', 'Thermodynamics', 'Clinical Psychology'];
    const verificationResults = ['AUTHENTIC', 'SUSPICIOUS', 'FRAUDULENT'] as const;

    const certificates: Certificate[] = [];

    for (let i = 0; i < count; i++) {
      const id = `cert-${i + 1}`;
      const status = statuses[i % statuses.length] as any;
      const qualificationType = qualificationTypes[i % qualificationTypes.length];
      const awardClass = awardClasses[i % awardClasses.length] as any;
      const programName = programNames[i % programNames.length];
      const specialization = specializations[i % specializations.length];
      const graduationDate = new Date();
      graduationDate.setFullYear(graduationDate.getFullYear() - (i % 5));
      graduationDate.setMonth(i % 12);
      graduationDate.setDate((i % 28) + 1);

      certificates.push({
        id,
        certificateNumber: `CERT-${1000 + i}`,
        studentId: `student-${100 + i}`,
        status,
        qualificationType: qualificationType as any,
        programName,
        specialization,
        awardClass,
        graduationDate,
        issueDate: new Date(graduationDate.getTime() + 1000 * 60 * 60 * 24 * 30), // 30 days after graduation
        isRevoked: status === 'REVOKED',
        revocationReason: status === 'REVOKED' ? 'Academic misconduct' : undefined,
        documentUrl: `https://example.com/certificates/${id}.pdf`,
        verificationCode: `VER-${2000 + i}`,
        student: { id: `student-${100 + i}` } as any,
        certificateHash: '',
        documentType: 'PDF',
        issuedBy: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: ''
      });
    }

    const response: PaginatedResponse<Certificate> = {
      data: certificates,
      total: count,
      page: 1,
      pageSize: count,
      totalPages: 1,
    };

    return of(response);
  }
}