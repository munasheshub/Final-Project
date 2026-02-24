import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VerificationLogService, GetVerificationLogsRequest, VerificationLogResponseDto } from '../services/verification-log.service';

@Component({
  selector: 'app-verification-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verification-history.component.html',
  styleUrls: ['./verification-history.component.scss']
})
export class VerificationHistoryComponent implements OnInit {
  verificationLogs: VerificationLogResponseDto[] = [];
  filteredLogs: VerificationLogResponseDto[] = [];
  loading: boolean = false;
  
  // Filter properties
  filters: GetVerificationLogsRequest = {
    certificateHash: '',
    certificateId: undefined,
    isSuccess: undefined,
    fromDate: '',
    toDate: '',
    ipAddress: ''
  };

  constructor(private verificationLogService: VerificationLogService) {}

  ngOnInit(): void {
    this.loadVerificationLogs();
  }

  loadVerificationLogs(): void {
    this.loading = true;
    const requestFilters = this.buildFilterRequest();
    
    this.verificationLogService.getVerificationLogs(requestFilters).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.verificationLogs = response.data;
          this.filteredLogs = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading verification logs:', error);
        this.loading = false;
      }
    });
  }

  buildFilterRequest(): GetVerificationLogsRequest {
    const request: GetVerificationLogsRequest = {};
    
    if (this.filters.certificateHash && this.filters.certificateHash.trim()) {
      request.certificateHash = this.filters.certificateHash.trim();
    }
    
    if (this.filters.certificateId !== undefined && this.filters.certificateId !== null) {
      request.certificateId = this.filters.certificateId;
    }
    
    if (this.filters.isSuccess !== undefined && this.filters.isSuccess !== null) {
      request.isSuccess = this.filters.isSuccess;
    }
    
    if (this.filters.fromDate) {
      request.fromDate = this.filters.fromDate;
    }
    
    if (this.filters.toDate) {
      request.toDate = this.filters.toDate;
    }
    
    if (this.filters.ipAddress && this.filters.ipAddress.trim()) {
      request.ipAddress = this.filters.ipAddress.trim();
    }
    
    return request;
  }

  applyFilters(): void {
    this.loadVerificationLogs();
  }

  clearFilters(): void {
    this.filters = {
      certificateHash: '',
      certificateId: undefined,
      isSuccess: undefined,
      fromDate: '',
      toDate: '',
      ipAddress: ''
    };
    this.loadVerificationLogs();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }
}
