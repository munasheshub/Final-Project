import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { StepperModule } from 'primeng/stepper';
import { InputTextModule } from 'primeng/inputtext';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ProgramService } from '@/core/services/program.service';
import { ProgramDto } from '@/core/models/program.model';
import { CertificateIssueDto } from '@/core/models/certificate-issue.model';
import { IpfsService } from '@/core/services/ipfs.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { BlockchainService } from '@/core/services/blockchain.service';
import { CertificateService, BlockchainCertificateIssueDto } from '../services/certificate.service';
import { CertificateDraftService } from '@/core/services/certificate-draft.service';
import { StudentService } from '@/core/services/student.service';
import { Student } from '@/core/models/api-response.model';

interface QualificationType {
    label: string;
    value: number;
}

declare global {
    interface Window {
        ethereum?: any;
    }
    }

interface AwardClass {
    label: string;
    value: number;
}

@Component({
    selector: 'app-issue-certificate',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        StepperModule,
        InputTextModule,
        DatePickerModule,
        SelectModule,
        FileUploadModule,
        MessageModule,
        ToastModule,
        TooltipModule
    ],
    providers: [MessageService],
    templateUrl: './certificate-issue.html',
    styleUrls: ['./certificate-issue.scss']
})
export class IssueCertificateComponent implements OnInit, OnDestroy {
    router = inject(Router);
    fb = inject(FormBuilder);
    programService = inject(ProgramService);
    studentService = inject(StudentService);
    programs = signal<ProgramDto[]>([]);
    students = signal<Student[]>([]);
    selectedStudent = signal<Student | null>(null);
    isLoadingStudents = signal(false);
    newCertificate : CertificateIssueDto = {} as CertificateIssueDto
    ipfsService = inject(IpfsService)
    blockchainService = inject(BlockchainService);
    certificateService = inject(CertificateService);
    messageService = inject(MessageService);
    draftService = inject(CertificateDraftService);
    // Forms for each step
    studentForm!: FormGroup;
    certificateForm!: FormGroup;
    documentForm!: FormGroup;
    blockchainForm!: FormGroup;

    // Current active step
    activeStep = signal(0);

    // Uploaded file
    uploadedFile = signal<File | null>(null);
    documentHash = signal<string>('');
    
    // Wallet connection
    walletConnected = signal(false);
    walletAddress = signal<string>('');
    isConnectingWallet = signal(false);

    // Transaction details
    estimatedGasFee = signal<string>('0.0045');
    certificateNumber = signal<string>('Auto-generated');
    
    // Loading states
    isSubmitting = signal(false);
    submitProgress = signal<string>('');

    // Dropdown options
    qualificationTypes: QualificationType[] = [
        { label: 'Certificate', value: 0 },
        { label: 'Diploma', value: 1 },
        { label: 'Degree', value: 2 },
        { label: 'Masters Degree', value: 3 },
        { label: 'Doctorate', value: 4 }
    ];

    awardClasses: AwardClass[] = [
        { label: 'Pass', value: 0 },
        { label: 'Lower Second', value: 1 },
        { label: 'Upper Second', value: 2 },
        { label: 'First Class', value: 3 },
        { label: 'Distinction', value: 4 }
    ];

    // Computed student name for summary
    studentName = computed(() => {
        const student = this.selectedStudent();
        return student ? `${student.firstName} ${student.lastName}` : 'N/A';
    });


    

    ngOnInit() {
        this.initializeForms();
        this.checkWalletConnection();
        
        if (window.ethereum) {
            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts: string[]) => {
                if (accounts.length === 0) {
                    this.walletConnected.set(false);
                    this.walletAddress.set('');
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Wallet Disconnected',
                        detail: 'Your wallet has been disconnected.'
                    });
                } else {
                    this.walletConnected.set(true);
                    this.walletAddress.set(accounts[0]);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Account Changed',
                        detail: `Switched to ${accounts[0].substring(0, 6)}...${accounts[0].substring(accounts[0].length - 4)}`
                    });
                }
            });

            // Listen for chain changes
            window.ethereum.on('chainChanged', (chainId: string) => {
                const chainIdDecimal = parseInt(chainId, 16);
                if (chainIdDecimal !== 11155111) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Network Changed',
                        detail: 'Please switch to Sepolia testnet for certificate issuance.'
                    });
                }
            });
        }
        this.loadPrograms();
        this.loadStudents();
        this.estimateGasFee();
    }

    // Check if wallet is already connected
    async checkWalletConnection() {
        if (!window.ethereum) return;

        try {
            const accounts = await window.ethereum.request({
                method: 'eth_accounts'
            });

            if (accounts && accounts.length > 0) {
                this.walletConnected.set(true);
                this.walletAddress.set(accounts[0]);
                this.blockchainForm.patchValue({
                    walletConnected: true,
                    walletAddress: accounts[0]
                });
            }
        } catch (error) {
            console.error('Failed to check wallet connection:', error);
        }
    }

     constructor(){}

    loadPrograms() {
        this.programService.getAllPrograms().subscribe((response) => {
            if (response.isSuccess) {
                this.programs.set(response.data ?? []);
            } else {
                console.error('Failed to load programs');
            }
        });
    }

    loadStudents() {
        this.isLoadingStudents.set(true);
        this.studentService.getAllStudents().subscribe({
            next: (response) => {
                if (response.isSuccess) {
                    this.students.set(response.data ?? []);
                    if (response.data?.length === 0) {
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'No Students Found',
                            detail: 'Please add students before issuing certificates.'
                        });
                    }
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load students'
                    });
                }
            },
            error: (error) => {
                console.error('Failed to load students:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load students. Please try again.'
                });
                this.isLoadingStudents.set(false);
            },
            complete: () => {
                this.isLoadingStudents.set(false);
            }
        });
    }

    onStudentSelect(event: any) {
        const selectedId = event.value;
        const student = this.students().find(s => s.id === selectedId);
        
        if (student) {
            this.selectedStudent.set(student);
            const fullName = `${student.firstName} ${student.lastName}`;
            this.studentForm.patchValue({
                studentId: student.id.toString(),
                studentNumber: student.studentNumber,
                fullName: fullName,
                dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth) : null,
                email: student.email || '',
                phoneNumber: student.phoneNumber || ''
            });
            // Mark the form as touched to trigger validation
            this.studentForm.markAsTouched();
        } else {
            // Clear selection if student not found
            this.selectedStudent.set(null);
            this.studentForm.patchValue({
                studentId: '',
                studentNumber: '',
                fullName: '',
                dateOfBirth: null,
                email: '',
                phoneNumber: ''
            });
        }
    }

    initializeForms() {
        // Step 1: Student Selection (data will be auto-populated from selected student)
        this.studentForm = this.fb.group({
            selectedStudentId: ['', Validators.required],
            studentId: [''], // Database student ID (integer as string)
            studentNumber: [''], // Student number for blockchain (e.g., S202600145)
            dateOfBirth: [''],
            fullName: [''],
            email: [''],
            phoneNumber: ['']
        });

        // Step 2: Certificate Details
        this.certificateForm = this.fb.group({
            qualificationType: ['', Validators.required],
            awardClass: ['', Validators.required],
            programName: ['', Validators.required],
            specialization: [''],
            graduationDate: ['', Validators.required],
            certificateNumber: ['']
        });

        // Step 3: Document Upload
        this.documentForm = this.fb.group({
            document: ['', Validators.required]
        });

        // Step 4: Blockchain
        this.blockchainForm = this.fb.group({
            walletConnected: [false, Validators.requiredTrue]
        });
    }

    // Navigation methods
    goToStep(step: number) {
        this.activeStep.set(step);
    }

    nextStep() {
        const currentStep = this.activeStep();
        
        // Validate current step
        if (!this.validateStep(currentStep)) {
            // Show appropriate error message based on step
            if (currentStep === 0 && !this.selectedStudent()) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Student Required',
                    detail: 'Please select a student to continue'
                });
            }
            return;
        }

        if (currentStep < 3) {
            this.activeStep.set(currentStep + 1);
        }
    }

    previousStep() {
        const currentStep = this.activeStep();
        if (currentStep > 0) {
            this.activeStep.set(currentStep - 1);
        }
    }

    validateStep(step: number): boolean {
        switch (step) {
            case 0:
                // Validate that a student is actually selected
                return this.studentForm.valid && this.selectedStudent() !== null;
            case 1:
                return this.certificateForm.valid;
            case 2:
                return this.documentForm.valid || this.uploadedFile() !== null;
            case 3:
                return this.walletConnected();
            default:
                return false;
        }
    }

    isStepCompleted(step: number): boolean {
        const currentStep = this.activeStep();
        return currentStep > step;
    }

    isStepActive(step: number): boolean {
        return this.activeStep() === step;
    }

    // File upload handler
    onFileSelect(event: any) {
        const file: File = event.files[0];
        if (!file) return;

        this.uploadedFile.set(file);
        this.documentForm.patchValue({ document: file.name });

        try {
            // Upload to IPFS endpoint
             this.ipfsService.uploadToIPFS(file).subscribe((response) => {
                if(response.isSuccess){

                    this.documentHash.set(response.data || "");

                }
             })
            
        } catch (error) {
            console.error('IPFS upload failed', error);
            this.documentHash.set('');
            this.messageService.add({
                severity: 'error',
                summary: 'Upload Failed',
                detail: 'Could not upload file to IPFS'
            });
        }
    }

    onFileRemove() {
        this.uploadedFile.set(null);
        this.documentHash.set('');
        this.documentForm.patchValue({ document: '' });
    }



    // AI Fraud Detection
    runAIAnalysis() {
        console.log('Running AI fraud detection analysis...');
        // Implement AI analysis logic
    }

    async estimateGasFee() {
        if (!window.ethereum) return;
        
        try {
            const estimate = await this.blockchainService.estimateIssuanceGas();
            this.estimatedGasFee.set(estimate.estimatedFeeEth);
        } catch (error) {
            console.error('Failed to estimate gas', error);
        }
    }

    

    async connectWallet() {
        // Prevent multiple simultaneous connection attempts
        if (this.isConnectingWallet()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Connection Pending',
                detail: 'Please check MetaMask and respond to the connection request.'
            });
            return;
        }

        // Check if already connected
        if (this.walletConnected()) {
            this.messageService.add({
                severity: 'info',
                summary: 'Already Connected',
                detail: 'Wallet is already connected.'
            });
            return;
        }

        if (!window.ethereum) {
            this.messageService.add({
                severity: 'error',
                summary: 'MetaMask Not Found',
                detail: 'Please install MetaMask extension to continue.'
            });
            return;
        }

        try {
            this.isConnectingWallet.set(true);

            // Check if already connected
            const existingAccounts = await window.ethereum.request({
                method: 'eth_accounts'
            });

            let accounts: string[];
            if (existingAccounts && existingAccounts.length > 0) {
                accounts = existingAccounts;
            } else {
                // Request new connection
                accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                });
            }

            const address = accounts[0];

            if (!address) {
                throw new Error('No account found');
            }

            // Verify we're on Sepolia network
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            const chainIdDecimal = parseInt(chainId, 16);
            
            if (chainIdDecimal !== 11155111) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Wrong Network',
                    detail: 'Please switch to Sepolia testnet in MetaMask.'
                });
                // Continue anyway, but warn the user
            }

            this.walletConnected.set(true);
            this.walletAddress.set(address);

            this.blockchainForm.patchValue({
                walletConnected: true,
                walletAddress: address
            });

            this.messageService.add({
                severity: 'success',
                summary: 'Wallet Connected',
                detail: `Connected to ${address.substring(0, 6)}...${address.substring(address.length - 4)}`
            });

        } catch (error: any) {
            console.error('Wallet connection failed', error);
            this.walletConnected.set(false);

            // Handle specific error codes
            if (error.code === -32002) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Request Pending',
                    detail: 'Please check MetaMask - there is a pending connection request waiting for your approval.'
                });
            } else if (error.code === 4001) {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Request Rejected',
                    detail: 'You rejected the connection request.'
                });
            } else {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Connection Failed',
                    detail: error.message || 'Failed to connect to wallet.'
                });
            }
        } finally {
            this.isConnectingWallet.set(false);
        }
    }

    disconnectWallet() {
        this.walletConnected.set(false);
        this.walletAddress.set('');
        this.blockchainForm.patchValue({ walletConnected: false });
    }

    // Submit to blockchain
    async submitToBlockchain() {
        if (!this.walletConnected()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Wallet not connected'
            });
            return;
        }

        if (!this.uploadedFile()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No document uploaded'
            });
            return;
        }

        // Validate all forms
        if (!this.studentForm.valid || !this.certificateForm.valid) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Please fill all required fields'
            });
            return;
        }

        this.isSubmitting.set(true);
        
        try {
            // Step 1: Prepare certificate data
            this.submitProgress.set('Preparing certificate data...');
            
            const studentIdValue = this.studentForm.value.studentId; // Database ID
            const studentNumberValue = this.studentForm.value.studentNumber; // Student number for blockchain
            
            // Validate studentId exists
            if (!studentIdValue) {
                throw new Error('Invalid Student ID. Please select a student.');
            }
            
            // Validate student number exists and length for bytes16 (max 16 characters)
            if (!studentNumberValue) {
                throw new Error('Invalid Student Number. Please select a student.');
            }
            
            if (studentNumberValue.length > 16) {
                throw new Error('Student Number is too long. Maximum 16 characters allowed.');
            }
            
            const graduationDate = new Date(this.certificateForm.value.graduationDate);
            
            // Validate graduation date
            if (isNaN(graduationDate.getTime())) {
                throw new Error('Invalid graduation date.');
            }
            
            const issueDate = Math.floor(graduationDate.getTime() / 1000);
            
            // Generate certificate hash (combine all certificate data)
            const certificateDataString = JSON.stringify({
                studentId: studentIdValue,
                studentNumber: studentNumberValue,
                fullName: this.studentForm.value.fullName,
                programName: this.certificateForm.value.programName,
                qualificationType: this.certificateForm.value.qualificationType,
                awardClass: this.certificateForm.value.awardClass,
                graduationDate: this.certificateForm.value.graduationDate,
                documentHash: this.documentHash()
            });
            
            const certHash = await this.blockchainService.generateCertificateHash(certificateDataString);
            
            // Use IPFS CID from upload (documentHash is the IPFS CID from the upload)
            const ipfsCID = this.blockchainService.stringToBytes32(this.documentHash());
            
            // Step 2: Submit to blockchain
            this.submitProgress.set('Submitting to blockchain... Please confirm in MetaMask');
            
            // Convert student number to bytes16 for blockchain
            const studentIdBytes16 = this.blockchainService.studentIdToBytes16(studentNumberValue);
            
            // Log blockchain data for debugging
            console.log('Blockchain submission data:', {
                certHash,
                ipfsCID,
                studentId: studentIdValue,
                studentNumber: studentNumberValue,
                studentIdBytes16: studentIdBytes16,
                issueDate,
                issueDataType: typeof issueDate
            });
            
            this.messageService.add({
                severity: 'info',
                summary: 'MetaMask',
                detail: 'Please confirm the transaction in MetaMask'
            });

            const blockchainResult = await this.blockchainService.issueCertificateToBlockchain({
                certHash,
                ipfsCID,
                studentId: studentNumberValue, // Use student number for blockchain
                issueDate
            });

            if (!blockchainResult.success) {
                throw new Error('Blockchain transaction failed');
            }

            this.messageService.add({
                severity: 'success',
                summary: 'Blockchain Success',
                detail: `Transaction confirmed: ${blockchainResult.transactionHash.substring(0, 10)}...`
            });

            // Step 3: Submit to backend
            this.submitProgress.set('Saving to database...');
            
            const student = this.selectedStudent()!;
            const graduationDateISO = new Date(this.certificateForm.value.graduationDate).toISOString();
            const dateOfBirthISO = student.dateOfBirth 
                ? new Date(student.dateOfBirth).toISOString() 
                : new Date().toISOString();

            const certificateData: BlockchainCertificateIssueDto = {
                // Student information from selected student
                studentId: student.id,
                fullName: `${student.firstName} ${student.lastName}`,
                dateOfBirth: dateOfBirthISO,
                email: student.email,
                phoneNumber: student.phoneNumber || undefined,
                
                // Certificate details
                programName: this.certificateForm.value.programName,
                specialization: this.certificateForm.value.specialization || undefined,
                qualificationType: this.certificateForm.value.qualificationType,
                awardClass: this.certificateForm.value.awardClass,
                graduationDate: graduationDateISO,
                certificateNumber: this.certificateForm.value.certificateNumber || '',
                
                // Document information
                fileHash: this.documentHash(),
                
                // Blockchain data
                transactionHash: blockchainResult.transactionHash,
                certHash,
                ipfsCID: this.documentHash(),
                walletAddress: this.walletAddress(),
                gasUsed: blockchainResult.gasUsed ? Number(blockchainResult.gasUsed) : undefined,
                blockNumber: blockchainResult.blockNumber ? Number(blockchainResult.blockNumber) : undefined
            };

            this.certificateService.issueCertificateWithBlockchain(certificateData).subscribe({
                next: (response) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Certificate issued successfully!'
                    });
                    
                    // Wait a bit before navigating to show the success message
                    setTimeout(() => {
                        this.router.navigate(['/certificates']);
                    }, 2000);
                },
                error: (error) => {
                    console.error('Backend submission failed:', error);
                    
                    // Save as draft since blockchain succeeded but backend failed
                    const draft = this.draftService.addDraft(
                        certificateData,
                        error.message || 'Failed to save to database'
                    );
                    
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Saved as Draft',
                        detail: `Certificate registered on blockchain (${blockchainResult.transactionHash.substring(0, 10)}...) but failed to save to database. Saved as draft for retry.`
                    });
                    
                    // Navigate to certificate list to show drafts
                    setTimeout(() => {
                        this.router.navigate(['/certificates']);
                    }, 2000);
                    
                    this.isSubmitting.set(false);
                    this.submitProgress.set('');
                },
                complete: () => {
                    this.isSubmitting.set(false);
                    this.submitProgress.set('');
                }
            });

        } catch (error: any) {
            console.error('Certificate issuance failed:', error);
            
            let errorMessage = 'Failed to issue certificate';
            
            // Handle specific MetaMask errors
            if (error.code === 4001) {
                errorMessage = 'Transaction rejected by user';
            } else if (error.code === -32603) {
                errorMessage = 'Transaction failed. Please check your wallet balance and network connection.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: errorMessage
            });
            this.isSubmitting.set(false);
            this.submitProgress.set('');
        }
    }

    // Cancel and go back
    cancel() {
        this.router.navigate(['/certificates']);
    }

    // Helper to get form control error
    hasError(form: FormGroup, controlName: string): boolean {
        const control = form.get(controlName);
        return !!(control && control.invalid && (control.dirty || control.touched));
    }

    getFileName(): string {
        const file = this.uploadedFile();
        return file ? file.name : '';
    }

    getFileSize(): string {
        const file = this.uploadedFile();
        if (!file) return '';
        
        const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
        return `${sizeInMB} MB`;
    }

    ngOnDestroy() {
        // Clean up MetaMask event listeners
        if (window.ethereum) {
            try {
                window.ethereum.removeListener('accountsChanged', () => {});
                window.ethereum.removeListener('chainChanged', () => {});
            } catch (error) {
                console.error('Error removing listeners:', error);
            }
        }
    }
}