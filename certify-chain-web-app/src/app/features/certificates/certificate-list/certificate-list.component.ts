// src/app/features/certificates/certificate-list/certificate-list.component.ts

import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

// PrimeNG v21 Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PaginatorModule } from 'primeng/paginator';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';

import { ConfirmationService, MessageService } from 'primeng/api';
import { CertificateService } from '../services/certificate.service';
import {
  Certificate,
  CertificateFilter,
  CertificateStatus,
  QualificationType
} from '../../../core/models/certificate.model';
import { Permission } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-certificate-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    MultiSelectModule,
    DatePickerModule,
    TagModule,
    CardModule,
    SkeletonModule,
    ToastModule,
    ConfirmDialogModule,
    PaginatorModule,
    TooltipModule,
    CheckboxModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './certificate-list.html',
  styleUrls: ['./certificate-list.scss']
})
export class CertificateListComponent implements OnInit {
  private certificateService = inject(CertificateService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private searchSubject$ = new Subject<string>();

  // Signals
  certificates = signal<Certificate[]>([]);
  selectedCertificates = signal<Certificate[]>([]);
  totalRecords = signal(0);
  page = signal(1);
  pageSize = signal(10);
  loading = signal(false);
  exportLoading = signal(false);
  searchText = signal('');
  viewMode = signal<'table' | 'grid'>('table');
  
  filter = signal<CertificateFilter>({});

  // Dropdown options
  pageSizeOptions = [10, 25, 50, 100];
  
  statusOptions = Object.values(CertificateStatus).map(status => ({
    label: status.replace('_', ' '),
    value: status
  }));
  
  qualificationTypeOptions = Object.values(QualificationType).map(type => ({
    label: type,
    value: type
  }));

  // Computed permissions
  canCreate = computed(() => this.authService.hasPermission(Permission.CERTIFICATE_CREATE));
  canUpdate = computed(() => this.authService.hasPermission(Permission.CERTIFICATE_UPDATE));
  canRevoke = computed(() => this.authService.hasPermission(Permission.CERTIFICATE_REVOKE));
  canExport = computed(() => this.authService.hasPermission(Permission.REPORTS_EXPORT));

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.loadCertificates();
  }

  private setupSearchDebounce(): void {
    this.searchSubject$
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(searchText => {
        this.filter.update(f => ({ ...f, search: searchText || undefined }));
        this.page.set(1);
        this.loadCertificates();
      });
  }

  loadCertificates(): void {
    this.loading.set(true);
    
    this.certificateService.getCertificates(
      this.page(),
      this.pageSize(),
      this.filter()
    ).subscribe({
      next: (response) => {
        this.certificates.set(response.data);
        this.totalRecords.set(response.total);
        this.loading.set(false);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load certificates'
        });
        this.loading.set(false);
      }
    });
  }

  onSearch(searchText: string): void {
    this.searchText.set(searchText);
    this.searchSubject$.next(searchText);
  }

  onPageChange(event: any): void {
    this.page.set(event.page + 1);
    this.pageSize.set(event.rows);
    this.loadCertificates();
  }

  onFilterChange(): void {
    this.page.set(1);
    this.loadCertificates();
  }

  clearFilters(): void {
    this.filter.set({});
    this.searchText.set('');
    this.page.set(1);
    this.loadCertificates();
  }

  viewCertificate(certificate: Certificate): void {
    this.router.navigate(['/certificates', certificate.id]);
  }

  createCertificate(): void {
    this.router.navigate(['/certificates/create']);
  }

  downloadCertificate(certificate: Certificate): void {
    this.certificateService.downloadCertificate(certificate.id).subscribe({
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

  exportToCSV(): void {
    this.exportLoading.set(true);
    
    const csvData = this.convertToCSV(this.certificates());
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificates-${new Date().toISOString()}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    this.exportLoading.set(false);
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Certificates exported successfully'
    });
  }

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

  getStatusSeverity(status: CertificateStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const severityMap: Record<CertificateStatus, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
      [CertificateStatus.ISSUED]: 'success',
      [CertificateStatus.VERIFIED]: 'success',
      [CertificateStatus.PENDING]: 'warn',
      [CertificateStatus.REVOKED]: 'danger',
      [CertificateStatus.FAILED]: 'danger'
    };
    return severityMap[status];
  }

  toggleViewMode(): void {
    this.viewMode.update(mode => mode === 'table' ? 'grid' : 'table');
  }

  refresh(): void {
    this.loadCertificates();
  }
}