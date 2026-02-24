// src/app/features/certificates/services/certificate.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CertificateFilter, CertificateCreateDto, CertificateRevocationDto, CertificateBatchUpload, CertificateStats, Certificate, CertificateStatus, QualificationType, AwardClass } from '../../../core/models/api-response.model';
import { ServiceResponse } from '../../../core/models/service-response.model';


export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// Backend certificate response structure (different from frontend Certificate model)
export interface CertificateApiResponse {
  id: number;
  certificateNumber: string;
  studentName: string; // Backend returns concatenated name
  programName: string;
  qualificationType: string; // String like "Degree", not enum
  awardClass: string; // String like "FirstClass", not enum
  graduationDate: string;
  status: string; // String like "success", not enum
  blockchainTxHash?: string;
  certificateHash?: string; // Hash used to identify certificate on blockchain
  ipfsCid?: string;
  verificationCode: string;
  createdAt: string;
}

export interface GetCertificatesRequest {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  status?: CertificateStatus;
  qualificationType?: QualificationType;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortDescending?: boolean;
}

export interface BlockchainCertificateIssueDto {
  // Student Information
  studentId: number;
  fullName: string;
  dateOfBirth: string;
  email?: string;
  phoneNumber?: string;
  
  // Certificate Details
  programName: string;
  specialization?: string;
  qualificationType: QualificationType;
  awardClass: AwardClass;
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
  getCertificates(request: GetCertificatesRequest = {}): Observable<ServiceResponse<PaginatedResponse<CertificateApiResponse>>> {
    let params = new HttpParams()
      .set('PageNumber', (request.pageNumber || 1).toString())
      .set('PageSize', (request.pageSize || 10).toString());

    if (request.searchTerm) {
      params = params.set('SearchTerm', request.searchTerm);
    }
    if (request.status !== undefined) {
      params = params.set('Status', request.status.toString());
    }
    if (request.qualificationType !== undefined) {
      params = params.set('QualificationType', request.qualificationType.toString());
    }
    if (request.fromDate) {
      params = params.set('FromDate', request.fromDate);
    }
    if (request.toDate) {
      params = params.set('ToDate', request.toDate);
    }
    if (request.sortBy) {
      params = params.set('SortBy', request.sortBy);
    }
    if (request.sortDescending !== undefined) {
      params = params.set('SortDescending', request.sortDescending.toString());
    }

    return this.http.get<ServiceResponse<PaginatedResponse<CertificateApiResponse>>>(this.API_URL, { params });
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
    return this.http.get(`${this.API_URL}/${certificateId}/qr`, {
      responseType: 'blob'
    });
  }

  /**
   * Generate certificate QR code image
   */
  generateQrCode(certificateId: string | number): Observable<Blob> {
    return this.http.get(`${this.API_URL}/${certificateId}/qr`, {
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
    
    return this.http.post(`${this.API_URL}`, payload);
  }

  /**
   * Build FormData from CertificateCreateDto
   */
  private buildFormData(data: CertificateCreateDto): FormData {
    const formData = new FormData();
    
    formData.append('studentId', data.studentId);
    formData.append('qualificationType', data.qualificationType.toString());
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
      items: certificates,
      totalCount: count,
      pageNumber: 1,
      pageSize: count,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false
    };

    return of(response);
  }
}