// src/app/features/certificates/certificate-list/certificate-list.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CertificateService } from '../services/certificate.service';

import { Permission } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { CertificateFilter, CertificateStatus, QualificationType, Certificate } from '../../../core/models/api-response.model';

@Component({
  selector: 'app-certificate-list',
  templateUrl: './certificate-list.html',
  styleUrls: ['./certificate-list.scss'],
  providers: [ConfirmationService, MessageService]
})
export class CertificateListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();

  // Data
  certificates: Certificate[] = [];
  selectedCertificates: Certificate[] = [];
  
  // Pagination
  totalRecords = 0;
  page = 1;
  pageSize = 10;
  pageSizeOptions = [10, 25, 50, 100];

  // Loading states
  loading = false;
  exportLoading = false;

  // Filters
  filter: CertificateFilter = {};
  searchText = '';
  
  // Dropdown options
  statusOptions = Object.values(CertificateStatus).map(status => ({
    label: status.replace('_', ' '),
    value: status
  }));
  
  qualificationTypeOptions = Object.values(QualificationType).map(type => ({
    label: type,
    value: type
  }));

  // Permissions
  canCreate = false;
  canUpdate = false;
  canRevoke = false;
  canExport = false;

  // View mode
  viewMode: 'table' | 'grid' = 'table';

  constructor(
    private certificateService: CertificateService,
    private authService: AuthService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.setupSearchDebounce();
    this.checkPermissions();
  }

  ngOnInit(): void {
    this.loadCertificates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Check user permissions
   */
  private checkPermissions(): void {
    this.canCreate = this.authService.hasPermission(Permission.CERTIFICATE_CREATE);
    this.canUpdate = this.authService.hasPermission(Permission.CERTIFICATE_UPDATE);
    this.canRevoke = this.authService.hasPermission(Permission.CERTIFICATE_REVOKE);
    this.canExport = this.authService.hasPermission(Permission.REPORTS_EXPORT);
  }

  /**
   * Setup search debounce
   */
  private setupSearchDebounce(): void {
    this.searchSubject$
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchText => {
        this.filter.search = searchText || undefined;
        this.page = 1;
        this.loadCertificates();
      });
  }

  /**
   * Load certificates with current filters
   */
  loadCertificates(): void {
    this.loading = true;
    
    this.certificateService.getCertificates(this.page, this.pageSize, this.filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.certificates = response.data;
          this.totalRecords = response.total;
          this.loading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load certificates'
          });
          this.loading = false;
        }
      });
  }

  /**
   * Handle search input
   */
  onSearch(searchText: string): void {
    this.searchText = searchText;
    this.searchSubject$.next(searchText);
  }

  /**
   * Handle page change
   */
  onPageChange(event: any): void {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.loadCertificates();
  }

  /**
   * Handle filter change
   */
  onFilterChange(): void {
    this.page = 1;
    this.loadCertificates();
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.filter = {};
    this.searchText = '';
    this.page = 1;
    this.loadCertificates();
  }

  /**
   * Navigate to certificate details
   */
  viewCertificate(certificate: Certificate): void {
    this.router.navigate(['/certificates', certificate.id]);
  }

  /**
   * Navigate to create certificate
   */
  createCertificate(): void {
    this.router.navigate(['/certificates/create']);
  }

  /**
   * Download certificate
   */
  downloadCertificate(certificate: Certificate): void {
    this.certificateService.downloadCertificate(certificate.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `certificate-${certificate.certificateNumber}.pdf`;
          link.click();
          window.URL.revokeObjectURL(url);
          
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Certificate downloaded successfully'
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to download certificate'
          });
        }
      });
  }

  /**
   * Revoke certificate
   */
  revokeCertificate(certificate: Certificate): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to revoke certificate ${certificate.certificateNumber}?`,
      header: 'Confirm Revocation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.router.navigate(['/certificates/revoke', certificate.id]);
      }
    });
  }

  /**
   * Export certificates to CSV
   */
  exportToCSV(): void {
    this.exportLoading = true;
    
    // Implement CSV export logic
    const csvData = this.convertToCSV(this.certificates);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificates-${new Date().toISOString()}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    this.exportLoading = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Certificates exported successfully'
    });
  }

  /**
   * Convert certificates to CSV
   */
  private convertToCSV(data: Certificate[]): string {
    const headers = [
      'Certificate Number',
      'Student Name',
      'Qualification',
      'Program',
      'Award Class',
      'Issue Date',
      'Status',
      'Blockchain TX'
    ];

    const rows = data.map(cert => [
      cert.certificateNumber,
      `${cert.student.firstName} ${cert.student.lastName}`,
      cert.qualificationType,
      cert.programName,
      cert.awardClass,
      new Date(cert.issueDate).toLocaleDateString(),
      cert.status,
      cert.blockchainTxHash || 'N/A'
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  }

  /**
   * Get status severity
   */
  getStatusSeverity(status: CertificateStatus): 'success' | 'info' | 'warning' | 'danger' {
    const severityMap: Record<CertificateStatus, 'success' | 'info' | 'warning' | 'danger'> = {
      [CertificateStatus.ISSUED]: 'success',
      [CertificateStatus.VERIFIED]: 'success',
      [CertificateStatus.PENDING]: 'warning',
      [CertificateStatus.REVOKED]: 'danger',
      [CertificateStatus.FAILED]: 'danger'
    };
    return severityMap[status];
  }

  /**
   * Toggle view mode
   */
  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'table' ? 'grid' : 'table';
  }

  /**
   * Refresh certificates
   */
  refresh(): void {
    this.loadCertificates();
  }
}