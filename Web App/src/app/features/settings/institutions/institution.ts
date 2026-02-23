import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { InstitutionDto, CreateInstitutionRequest, CreateAddressRequest } from '@/core/models/institution.model';
import { InstitutionService } from '@/core/services/institution.service';
import { BlockchainService } from '@/core/services/blockchain.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-institutions',
    standalone: true,
    providers: [MessageService],
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        CardModule,
        TableModule,
        InputTextModule,
        TextareaModule,
        TagModule,
        IconFieldModule,
        InputIconModule,
        DialogModule,
        ToastModule,
        TooltipModule
    ],
    templateUrl: './institution.html',
    styleUrls: ['./institution.scss']
})
export class InstitutionComponent implements OnInit {
    institutions = signal<InstitutionDto[]>([]);
    institution: CreateInstitutionRequest = {
        name: '',
        code: '',
        subdomain: '',
        email: '',
        phoneNumber: '',
        website: '',
        description: '',
        address: {
            street: '',
            city: '',
            province: '',
            country: '',
            postalCode: ''
        }
    };
    selectedInstitution: InstitutionDto | null = null;
    searchValue = signal<string>('');
    institutionService = inject(InstitutionService);
    messageService = inject(MessageService);
    blockchainService = inject(BlockchainService);
    visible = signal(false);
    viewModalVisible = signal(false);
    isEditMode = signal(false);
    
    // Blockchain related signals
    walletConnected = signal(false);
    adminAddress = signal<string>('');
    showAuthorizeDialog = signal(false);
    showDeauthorizeDialog = signal(false);
    blockchainAddress = '';
    isLoadingBlockchain = signal(false);

    // Filtered institutions based on search
    filteredInstitutions = computed<InstitutionDto[]>(() => {
        let filtered = this.institutions();

        // Filter by search
        const search = this.searchValue().toLowerCase();
        if (search) {
            filtered = filtered.filter(i => 
                i.name.toLowerCase().includes(search) ||
                i.code.toLowerCase().includes(search) ||
                (i.email && i.email.toLowerCase().includes(search)) ||
                (i.address?.city && i.address.city.toLowerCase().includes(search)) ||
                (i.address?.country && i.address.country.toLowerCase().includes(search))
            );
        }
        
        return filtered;
    });

    ngOnInit() {
        this.loadInstitutions();
        this.checkWalletConnection();
    }

    loadInstitutions() {
        this.institutionService.getAllInstitutions().subscribe({
            next: (response) => {
                if (response.isSuccess) {
                    this.institutions.set(response.data ?? []);
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load institutions'
                    });
                }
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message || 'Failed to load institutions'
                });
            }
        });
    }

    formatDate(date: Date | string): string {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
        }).format(dateObj);
    }

    getInitials(institution: InstitutionDto): string {
        return institution.name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .substring(0, 2)
            .toUpperCase();
    }

    getAvatarColor(name: string): string {
        const colors = [
            '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', 
            '#10b981', '#06b6d4', '#6366f1', '#ef4444',
            '#14b8a6', '#f97316'
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    }

    getAvatarColorSecondary(name: string): string {
        const colors = [
            '#60a5fa', '#a78bfa', '#f472b6', '#fbbf24',
            '#34d399', '#22d3ee', '#818cf8', '#f87171',
            '#2dd4bf', '#fb923c'
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    }

    onSearch(event: any) {
        this.searchValue.set(event.target.value);
    }

    // Auto-generate code from name
    onNameChange(event: any) {
        const name = event.target.value;
        if (name && !this.isEditMode()) {
            this.institution.code = this.generateCodeFromName(name);
            this.institution.subdomain = this.generateSubdomainFromName(name);
        }
    }

    generateCodeFromName(name: string): string {
        // Remove special characters and split into words
        const words = name
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .trim()
            .split(/\s+/)
            .filter(word => word.length > 0);

        if (words.length === 0) return '';

        let code = '';
        
        if (words.length === 1) {
            // Single word: take first 3-5 characters
            code = words[0].substring(0, Math.min(5, words[0].length));
        } else if (words.length === 2) {
            // Two words: take first 2-3 chars from each
            code = words[0].substring(0, 3) + words[1].substring(0, 3);
        } else {
            // Multiple words: take first letter of each word (max 6)
            code = words.slice(0, 6).map(word => word.charAt(0)).join('');
        }

        return code.toUpperCase();
    }

    generateSubdomainFromName(name: string): string {
        // Create a URL-friendly subdomain from institution name
        // Remove special characters, convert to lowercase, replace spaces with hyphens
        const subdomain = name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
            .trim()
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
            .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

        // Add timestamp suffix to ensure uniqueness (last 6 digits)
        const timestamp = Date.now().toString().slice(-6);
        
        return `${subdomain}-${timestamp}`;
    }

    // Show modal for creating new institution
    show() {
        this.isEditMode.set(false);
        this.institution = {
            name: '',
            code: '',
            subdomain: '',
            email: '',
            phoneNumber: '',
            website: '',
            description: '',
            address: {
                street: '',
                city: '',
                province: '',
                country: '',
                postalCode: ''
            }
        };
        this.visible.set(true);
    }

    // Hide modal
    hide() {
        this.visible.set(false);
        this.selectedInstitution = null;
    }

    // Submit form
    onSubmit() {
        if (this.isEditMode()) {
            this.updateInstitution();
        } else {
            this.createInstitution();
        }
    }

    createInstitution() {
        this.institutionService.createInstitution(this.institution).subscribe({
            next: (response) => {
                if (response.isSuccess && response.data) {
                    this.hide();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Institution created successfully'
                    });
                    this.loadInstitutions();
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: response.message || 'Failed to create institution'
                    });
                }
            },
            error: (error: Error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Institution Creation Failed',
                    detail: error.message || 'An error occurred'
                });
            }
        });
    }

    updateInstitution() {
        if (!this.selectedInstitution) return;

        const updateRequest = {
            ...this.institution,
            id: this.selectedInstitution.id!
        };

        this.institutionService.updateInstitution(updateRequest).subscribe({
            next: (response) => {
                if (response.isSuccess) {
                    this.hide();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Institution updated successfully'
                    });
                    this.loadInstitutions();
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: response.message || 'Failed to update institution'
                    });
                }
            },
            error: (error: Error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Update Failed',
                    detail: error.message || 'An error occurred'
                });
            }
        });
    }

    // Cancel and close
    onCancel() {
        this.hide();
    }

    viewDetails(institution?: InstitutionDto) {
        const institutionToView = institution || this.selectedInstitution;
        if (institutionToView) {
            this.selectedInstitution = institutionToView;
            this.viewModalVisible.set(true);
        }
    }

    hideViewModal() {
        this.viewModalVisible.set(false);
        this.selectedInstitution = null;
    }

    editInstitution(institution?: InstitutionDto) {
        const institutionToEdit = institution || this.selectedInstitution;
        if (institutionToEdit) {
            this.selectedInstitution = institutionToEdit;
            this.isEditMode.set(true);
            this.institution = {
                name: institutionToEdit.name,
                code: institutionToEdit.code,
                subdomain: institutionToEdit.subdomain || '',
                email: institutionToEdit.email,
                phoneNumber: institutionToEdit.phoneNumber || '',
                website: institutionToEdit.website || '',
                description: institutionToEdit.description || '',
                address: institutionToEdit.address ? {
                    street: institutionToEdit.address.street || '',
                    city: institutionToEdit.address.city || '',
                    province: institutionToEdit.address.province || '',
                    country: institutionToEdit.address.country || '',
                    postalCode: institutionToEdit.address.postalCode || ''
                } : {
                    street: '',
                    city: '',
                    province: '',
                    country: '',
                    postalCode: ''
                }
            };
            this.visible.set(true);
        }
    }

    deleteInstitution(institution?: InstitutionDto) {
        const institutionToDelete = institution || this.selectedInstitution;
        if (institutionToDelete && institutionToDelete.id) {
            if (confirm(`Are you sure you want to delete ${institutionToDelete.name}?`)) {
                this.institutionService.deleteInstitution(institutionToDelete.id).subscribe({
                    next: (response) => {
                        if (response.isSuccess) {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Success',
                                detail: 'Institution deleted successfully'
                            });
                            this.loadInstitutions();
                        } else {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: response.message || 'Failed to delete institution'
                            });
                        }
                    },
                    error: (error: Error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Delete Failed',
                            detail: error.message || 'An error occurred'
                        });
                    }
                });
            }
        }
    }
    // Blockchain Methods
    async checkWalletConnection() {
        try {
            if (window.ethereum) {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts && accounts.length > 0) {
                    this.adminAddress.set(accounts[0]);
                    this.walletConnected.set(true);
                }
            }
        } catch (error) {
            console.error('Error checking wallet:', error);
        }
    }

    async connectWallet() {
        try {
            if (!window.ethereum) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'MetaMask Not Found',
                    detail: 'Please install MetaMask to continue'
                });
                return;
            }

            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            
            // Check network
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            const chainIdNumber = parseInt(chainId, 16);
            
            if (chainIdNumber !== environment.blockchain.chainId) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Wrong Network',
                    detail: `Please switch to ${environment.blockchain.network} (Chain ID: ${environment.blockchain.chainId})`,
                    life: 8000
                });
            }
            
            this.adminAddress.set(accounts[0]);
            this.walletConnected.set(true);
            
            this.messageService.add({
                severity: 'success',
                summary: 'Wallet Connected',
                detail: `Connected as ${accounts[0].substring(0, 10)}...`
            });
        } catch (error: any) {
            this.messageService.add({
                severity: 'error',
                summary: 'Connection Failed',
                detail: error.message || 'Failed to connect wallet'
            });
        }
    }

    openAuthorizeDialog(institution: InstitutionDto) {
        if (!this.walletConnected()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Wallet Not Connected',
                detail: 'Please connect your wallet first'
            });
            return;
        }
        this.selectedInstitution = institution;
        this.blockchainAddress = institution.blockchainAddress || '';
        this.showAuthorizeDialog.set(true);
    }

    async authorizeInstitution() {
        if (!this.selectedInstitution || !this.selectedInstitution.id) return;

        if (!this.blockchainAddress || !this.blockchainAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
            this.messageService.add({
                severity: 'error',
                summary: 'Invalid Address',
                detail: 'Please provide a valid Ethereum address'
            });
            return;
        }

        try {
            this.isLoadingBlockchain.set(true);

            await this.blockchainService.authorizeInstitution(
                this.selectedInstitution.id,
                this.blockchainAddress,
                this.selectedInstitution.name
            );

            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Institution authorized on blockchain successfully'
            });

            this.showAuthorizeDialog.set(false);
            this.loadInstitutions();
        } catch (error: any) {
            this.messageService.add({
                severity: 'error',
                summary: 'Authorization Failed',
                detail: error.message || 'Failed to authorize institution on blockchain'
            });
        } finally {
            this.isLoadingBlockchain.set(false);
        }
    }

    openDeauthorizeDialog(institution: InstitutionDto) {
        if (!this.walletConnected()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Wallet Not Connected',
                detail: 'Please connect your wallet first'
            });
            return;
        }
        this.selectedInstitution = institution;
        this.showDeauthorizeDialog.set(true);
    }

    async deauthorizeInstitution() {
        if (!this.selectedInstitution || !this.selectedInstitution.id) return;

        try {
            this.isLoadingBlockchain.set(true);

            await this.blockchainService.deauthorizeInstitution(this.selectedInstitution.id);

            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Institution deauthorized from blockchain successfully'
            });

            this.showDeauthorizeDialog.set(false);
            this.loadInstitutions();
        } catch (error: any) {
            this.messageService.add({
                severity: 'error',
                summary: 'Deauthorization Failed',
                detail: error.message || 'Failed to deauthorize institution from blockchain'
            });
        } finally {
            this.isLoadingBlockchain.set(false);
        }
    }

    getBlockchainStatusSeverity(institution: InstitutionDto): 'success' | 'warn' | 'secondary' {
        if (institution.isBlockchainAuthorized) {
            return 'success';
        }
        return 'secondary';
    }

    getBlockchainStatusLabel(institution: InstitutionDto): string {
        if (institution.isBlockchainAuthorized) {
            return 'Authorized';
        }
        return 'Not Authorized';
    }

    getContractAddress(): string {
        return environment.blockchain.contractAddress;
    }}
