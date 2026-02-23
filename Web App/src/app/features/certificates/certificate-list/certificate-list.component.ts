import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, signal, computed, inject, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Router } from 'express';
import { RouterLink } from "@angular/router";
import { CertificateDraftService, CertificateDraft } from '@/core/services/certificate-draft.service';
import { CertificateService, GetCertificatesRequest, CertificateApiResponse } from '../services/certificate.service';
import { BlockchainService } from '@/core/services/blockchain.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { CertificateStatus, QualificationType } from '@/core/models/api-response.model';

interface Certificate {
    id: string;
    studentName: string;
    studentId: string;
    certificateNumber: string;
    program: string;
    programDetail: string;
    award: string;
    status: 'Active' | 'Pending' | 'Revoked' | 'On Blockchain' | 'Draft';
    issued: Date;
    certificateHash?: string;
    blockchainTxHash?: string;
    ipfsCid?: string;
}

interface StatusCount {
    status: string;
    count: number;
    icon: string;
    iconColor: string;
    bgColor: string;
}

@Component({
    selector: 'app-certificates',
    standalone: true,
    imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    TableModule,
    TooltipModule,
    InputTextModule,
    SelectModule,
    TagModule,
    MenuModule,
    RouterLink,
    IconFieldModule,
    InputIconModule,
    ToastModule
],
    providers: [MessageService],
    templateUrl: './certificate-list.html',
    styleUrls: ['./certificate-list.scss']
})
export class CertificateListComponent implements OnInit, OnDestroy {
    certificates = signal<Certificate[]>([]);
    drafts = signal<CertificateDraft[]>([]);
    searchValue = signal<string>('');
    selectedStatus = signal<string>('All Status');
    isLoading = signal(false);
    totalRecords = signal(0);
    currentPage = signal(1);
    pageSize = signal(10);
    
    draftService = inject(CertificateDraftService);
    certificateService = inject(CertificateService);
    blockchainService = inject(BlockchainService);
    messageService = inject(MessageService);
    syncingCertificates = signal<Map<string, boolean>>(new Map());
    //router = inject(Router);
    statusOptions = [
        { label: 'All Status', value: 'All Status' },
        { label: 'Active', value: 'Active' },
        { label: 'Pending', value: 'Pending' },
        { label: 'Revoked', value: 'Revoked' },
        { label: 'On Blockchain', value: 'On Blockchain' },
        { label: 'Draft', value: 'Draft' }
    ];

    // Computed statistics
    statusCounts = computed<StatusCount[]>(() => {
        const certs = this.certificates();
        const drafts = this.drafts();
        return [
            {
                status: 'Active',
                count: certs.filter(c => c.status === 'Active').length,
                icon: 'pi pi-check-circle',
                iconColor: 'text-blue-500',
                bgColor: 'bg-blue-50 dark:bg-blue-500/10'
            },
            {
                status: 'Pending',
                count: certs.filter(c => c.status === 'Pending').length,
                icon: 'pi pi-clock',
                iconColor: 'text-orange-500',
                bgColor: 'bg-orange-50 dark:bg-orange-500/10'
            },
            {
                status: 'Revoked',
                count: certs.filter(c => c.status === 'Revoked').length,
                icon: 'pi pi-times-circle',
                iconColor: 'text-red-500',
                bgColor: 'bg-red-50 dark:bg-red-500/10'
            },
            {
                status: 'On Blockchain',
                count: certs.filter(c => c.status === 'On Blockchain').length,
                icon: 'pi pi-th-large',
                iconColor: 'text-gray-500',
                bgColor: 'bg-gray-50 dark:bg-gray-500/10'
            },
            {
                status: 'Draft',
                count: drafts.length,
                icon: 'pi pi-file-edit',
                iconColor: 'text-purple-500',
                bgColor: 'bg-purple-50 dark:bg-purple-500/10'
            }
        ];
    });

    // Convert drafts to Certificate format for display
    draftsAsCertificates = computed<Certificate[]>(() => {
        return this.drafts().map(draft => ({
            id: draft.draftId,
            studentName: draft.fullName,
            studentId: String(draft.studentId),
            certificateNumber: draft.certificateNumber || 'Pending',
            program: draft.programName,
            programDetail: draft.specialization || '',
            award: draft.awardClass,
            status: 'Draft' as any,
            issued: new Date(draft.savedAt)
        }));
    });

    // Combined certificates and drafts for display
    // Drafts are shown on first page only since they're client-side
    displayCertificates = computed<Certificate[]>(() => {
        const apiCerts = this.certificates();
        const draftCerts = this.draftsAsCertificates();
        
        // Only include drafts on the first page
        if (this.currentPage() === 1 && this.selectedStatus() === 'All Status') {
            return [...draftCerts, ...apiCerts];
        }
        
        // If filtering by Draft status, show only drafts
        if (this.selectedStatus() === 'Draft') {
            return draftCerts;
        }
        
        return apiCerts;
    });

    actionMenuItems: MenuItem[] = [
        {
            label: 'View Details',
            icon: 'pi pi-eye',
            command: () => this.viewDetails()
        },
        {
            label: 'Download',
            icon: 'pi pi-download',
            command: () => this.download()
        },
        {
            label: 'Verify',
            icon: 'pi pi-verified',
            command: () => this.verify()
        },
        {
            separator: true
        },
        {
            label: 'Revoke',
            icon: 'pi pi-ban',
            command: () => this.revoke()
        }
    ];

    currentCertificate: Certificate | null = null;

    ngOnInit() {
        this.loadCertificates();
        this.loadDrafts();
    }

    loadDrafts() {
        // Load drafts from draft service
        this.drafts.set(this.draftService.getAllDrafts());
    }

    loadCertificates() {
        // If filtering by Draft, don't call API (drafts are client-side only)
        if (this.selectedStatus() === 'Draft') {
            this.certificates.set([]);
            this.totalRecords.set(0);
            return;
        }
        
        this.isLoading.set(true);
        
        const request: GetCertificatesRequest = {
            pageNumber: this.currentPage(),
            pageSize: this.pageSize(),
            searchTerm: this.searchValue() || undefined,
            sortDescending: true
        };

        // Add status filter if not "All Status" and not "Draft"
        if (this.selectedStatus() !== 'All Status' && this.selectedStatus() !== 'Draft') {
            request.status = this.mapStatusToEnum(this.selectedStatus());
        }

        this.certificateService.getCertificates(request).subscribe({
            next: (response) => {
                console.log('API Response:', response); // Debug log
                
                if (!response.isSuccess || !response.data) {
                    console.error('API returned unsuccessful response:', response.message);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: response.message || 'Failed to load certificates'
                    });
                    this.certificates.set([]);
                    this.totalRecords.set(0);
                    this.isLoading.set(false);
                    return;
                }
                
                const paginatedData = response.data;
                
                // Map API certificates to UI format
                try {
                    const apiCertificates = (paginatedData.items || []).map(cert => this.mapApiCertificateToUI(cert));
                    this.certificates.set(apiCertificates);
                    this.totalRecords.set(paginatedData.totalCount || 0);
                } catch (mappingError) {
                    console.error('Error mapping certificates:', mappingError);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to process certificate data'
                    });
                    this.certificates.set([]);
                    this.totalRecords.set(0);
                }
                
                this.isLoading.set(false);
            },
            error: (error) => {
                console.error('Failed to load certificates:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load certificates'
                });
                this.isLoading.set(false);
            }
        });
    }

    /**
     * Map backend certificate status enum to UI status string
     */
    mapStatusToUIString(status: CertificateStatus): Certificate['status'] {
        switch (status) {
            case CertificateStatus.Draft:
                return 'Draft';
            case CertificateStatus.PendingVerification:
                return 'Pending';
            case CertificateStatus.Verified:
                return 'Active';
            case CertificateStatus.Revoked:
                return 'Revoked';
            case CertificateStatus.Flagged:
                return 'On Blockchain'; // or another appropriate status
            case CertificateStatus.Expired:
                return 'Revoked'; // or make a new status
            default:
                return 'Pending';
        }
    }

    /**
     * Map UI status string to backend enum
     */
    mapStatusToEnum(status: string): CertificateStatus | undefined {
        switch (status) {
            case 'Draft':
                return CertificateStatus.Draft;
            case 'Pending':
                return CertificateStatus.PendingVerification;
            case 'Active':
                return CertificateStatus.Verified;
            case 'Revoked':
                return CertificateStatus.Revoked;
            case 'On Blockchain':
                return CertificateStatus.Flagged;
            default:
                return undefined;
        }
    }

    /**
     * Map qualification type enum to display string
     */
    mapQualificationTypeToString(type: QualificationType): string {
        switch (type) {
            case QualificationType.Certificate:
                return 'Certificate';
            case QualificationType.Diploma:
                return 'Diploma';
            case QualificationType.Degree:
                return 'Bachelor Degree';
            case QualificationType.MastersDegree:
                return 'Masters Degree';
            case QualificationType.Doctorate:
                return 'Doctorate';
            default:
                return 'Unknown';
        }
    }

    /**
     * Parse string qualification type from backend to enum
     */
    parseQualificationType(type: string): QualificationType {
        switch (type?.toLowerCase()) {
            case 'certificate':
                return QualificationType.Certificate;
            case 'diploma':
                return QualificationType.Diploma;
            case 'degree':
            case 'bachelor':
            case 'bachelordegree':
                return QualificationType.Degree;
            case 'mastersdegree':
            case 'masters':
                return QualificationType.MastersDegree;
            case 'doctorate':
            case 'phd':
                return QualificationType.Doctorate;
            default:
                return QualificationType.Degree;
        }
    }

    /**
     * Parse string status from backend to enum
     */
    parseStatusString(status: string): CertificateStatus {
        switch (status?.toLowerCase()) {
            case 'draft':
                return CertificateStatus.Draft;
            case 'pending':
            case 'pendingverification':
                return CertificateStatus.PendingVerification;
            case 'verified':
            case 'active':
            case 'success':
                return CertificateStatus.Verified;
            case 'revoked':
                return CertificateStatus.Revoked;
            case 'flagged':
                return CertificateStatus.Flagged;
            case 'expired':
                return CertificateStatus.Expired;
            default:
                return CertificateStatus.Verified;
        }
    }

    /**
     * Map API certificate to UI certificate format
     */
    mapApiCertificateToUI(apiCert: CertificateApiResponse): Certificate {
        // Backend returns studentName as concatenated string
        const studentName = apiCert.studentName || 'Unknown Student';
        
        // Use certificateNumber as student ID for now (or extract from another field if available)
        const studentId = apiCert.certificateNumber || 'N/A';
        
        // Parse the backend status string to enum, then map to UI string
        const statusEnum = this.parseStatusString(apiCert.status);
        
        return {
            id: apiCert.id?.toString() || '',
            studentName: studentName,
            studentId: studentId,
            certificateNumber: apiCert.certificateNumber,
            program: apiCert.programName || 'Unknown Program',
            programDetail: '', // Backend doesn't return specialization in this response
            award: apiCert.awardClass || '',
            status: this.mapStatusToUIString(statusEnum),
            issued: new Date(apiCert.createdAt || apiCert.graduationDate),
            certificateHash: apiCert.certificateHash,
            blockchainTxHash: apiCert.blockchainTxHash,
            ipfsCid: apiCert.ipfsCid
        };
    }

    /**
     * Sync certificate status from blockchain
     * Checks if certificate has been revoked on blockchain and updates status accordingly
     */
    async syncCertificateFromBlockchain(certificate: Certificate): Promise<void> {
        // Skip if no blockchain transaction hash (not on blockchain yet)
        if (!certificate.blockchainTxHash) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Not on Blockchain',
                detail: 'This certificate has not been issued to the blockchain yet.',
                life: 3000
            });
            return;
        }

        // Check if already syncing
        if (this.syncingCertificates().get(certificate.id)) {
            return;
        }

        // Mark as syncing
        const syncMap = new Map(this.syncingCertificates());
        syncMap.set(certificate.id, true);
        this.syncingCertificates.set(syncMap);

        try {
            // Get or generate the certificate hash
            let certHash: string;
            
            if (certificate.certificateHash) {
                // Use the hash from backend if available
                certHash = certificate.certificateHash;
            } else {
                // Generate certificate hash from the certificate data
                // Note: This should match the hash generation logic used when issuing the certificate
                const certData = JSON.stringify({
                    certificateNumber: certificate.certificateNumber,
                    studentId: certificate.studentId,
                    program: certificate.program,
                    award: certificate.award,
                    issued: certificate.issued.getTime()
                });
                
                certHash = await this.blockchainService.generateCertificateHash(certData);
            }
            
            // Get certificate details from blockchain
            const blockchainCert = await this.blockchainService.getCertificateDetails(certHash);
            
            if (!blockchainCert.exists) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Not Found on Blockchain',
                    detail: 'Certificate not found on blockchain. It may not have been successfully issued.',
                    life: 4000
                });
                return;
            }

            // Check if status has changed (0 = Active, 1 = Revoked on blockchain)
            const isRevokedOnBlockchain = blockchainCert.status === 1;
            const isRevokedInUI = certificate.status === 'Revoked';

            if (isRevokedOnBlockchain && !isRevokedInUI) {
                // Update certificate status in the UI
                const updatedCerts = this.certificates().map(cert => {
                    if (cert.id === certificate.id) {
                        return { ...cert, status: 'Revoked' as any };
                    }
                    return cert;
                });
                this.certificates.set(updatedCerts);

                this.messageService.add({
                    severity: 'info',
                    summary: 'Status Updated',
                    detail: 'Certificate has been revoked on the blockchain. Status updated to Revoked.',
                    life: 4000
                });

                // TODO: Call backend API to update the certificate status in database
                // this.certificateService.updateCertificateStatus(certificate.id, 'Revoked').subscribe();
            } else if (!isRevokedOnBlockchain && isRevokedInUI) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Status Mismatch',
                    detail: 'Certificate is marked as revoked locally but is active on blockchain.',
                    life: 4000
                });
            } else {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Synced',
                    detail: 'Certificate status is in sync with blockchain.',
                    life: 3000
                });
            }

        } catch (error: any) {
            console.error('Failed to sync certificate:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Sync Failed',
                detail: error.message || 'Failed to sync certificate with blockchain',
                life: 5000
            });
        } finally {
            // Mark as not syncing
            const syncMap = new Map(this.syncingCertificates());
            syncMap.delete(certificate.id);
            this.syncingCertificates.set(syncMap);
        }
    }

    /**
     * Check if a certificate is currently being synced
     */
    isSyncing(certificateId: string): boolean {
        return this.syncingCertificates().get(certificateId) || false;
    }

    getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'secondary' | 'info' | 'contrast' {
        switch (status) {
            case 'Active':
                return 'success';
            case 'Pending':
                return 'warn';
            case 'Revoked':
                return 'danger';
            case 'On Blockchain':
                return 'secondary';
            case 'Draft':
                return 'contrast';
            default:
                return 'info';
        }
    }

    formatDate(date: Date): string {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
        }).format(date);
    }

    onSearch(event: any) {
        this.searchValue.set(event.target.value);
        // Debounce search - only search when user stops typing
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        this.searchTimeout = setTimeout(() => {
            this.currentPage.set(1); // Reset to first page on search
            this.loadCertificates();
        }, 500); // Wait 500ms after user stops typing
    }

    private searchTimeout: any;

    onStatusChange(event: any) {
        this.selectedStatus.set(event.value);
        this.currentPage.set(1); // Reset to first page on filter change
        this.loadCertificates();
    }

    onPageChange(event: any) {
        this.currentPage.set(event.page + 1); // PrimeNG uses 0-based pages
        this.pageSize.set(event.rows);
        this.loadCertificates();
    }

    batchUpload() {
        console.log('Batch upload clicked');
        // Implement batch upload logic
    }

    issueCertificate() {
        //this.router.navigate(['/certificates/create']);
    }

    viewDetails() {
        console.log('View details');
    }

    download() {
        console.log('Download certificate');
    }

    verify() {
        console.log('Verify certificate');
    }

    revoke() {
        console.log('Revoke certificate');
    }

    /**
     * Get menu items based on certificate status
     */
    getMenuItems(certificate: Certificate): MenuItem[] {
        this.currentCertificate = certificate;
        
        // If it's a draft, show retry and delete options
        if (certificate.status === 'Draft') {
            return [
                {
                    label: 'Retry Submit',
                    icon: 'pi pi-refresh',
                    command: () => this.retryDraft(certificate.id)
                },
                {
                    label: 'View Details',
                    icon: 'pi pi-eye',
                    command: () => this.viewDraftDetails(certificate.id)
                },
                {
                    separator: true
                },
                {
                    label: 'Delete Draft',
                    icon: 'pi pi-trash',
                    command: () => this.deleteDraft(certificate.id)
                }
            ];
        }
        
        // Regular certificate menu items
        return this.actionMenuItems;
    }

    /**
     * Retry submitting a draft to backend
     */
    retryDraft(draftId: string) {
        const draft = this.draftService.getDraft(draftId);
        if (!draft) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Draft not found'
            });
            return;
        }

        this.messageService.add({
            severity: 'info',
            summary: 'Retrying',
            detail: 'Submitting certificate to database...'
        });

        // Attempt to resubmit to backend
        this.certificateService.issueCertificateWithBlockchain(draft).subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Certificate saved successfully!'
                });
                
                // Remove from drafts
                this.draftService.removeDraft(draftId);
                this.loadDrafts();
                this.loadCertificates();
            },
            error: (error) => {
                // Update retry count
                this.draftService.updateDraft(draftId, {
                    retryCount: draft.retryCount + 1,
                    lastError: error.message || 'Failed to save to database'
                });
                
                this.messageService.add({
                    severity: 'error',
                    summary: 'Retry Failed',
                    detail: error.message || 'Failed to save certificate to database'
                });
                
                this.loadDrafts();
            }
        });
    }

    /**
     * View draft details
     */
    viewDraftDetails(draftId: string) {
        const draft = this.draftService.getDraft(draftId);
        if (draft) {
            console.log('Draft details:', draft);
            // You can open a dialog or navigate to a details page
            this.messageService.add({
                severity: 'info',
                summary: 'Draft Details',
                detail: `Transaction: ${draft.transactionHash.substring(0, 10)}... | Retry count: ${draft.retryCount}`
            });
        }
    }

    /**
     * Delete a draft
     */
    deleteDraft(draftId: string) {
        this.draftService.removeDraft(draftId);
        this.loadDrafts();
        this.messageService.add({
            severity: 'info',
            summary: 'Deleted',
            detail: 'Draft removed successfully'
        });
    }

    ngOnDestroy() {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
    }
}