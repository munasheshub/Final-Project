import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { StepperModule } from 'primeng/stepper';
import { InputTextModule } from 'primeng/inputtext';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { async } from 'rxjs';

interface QualificationType {
    label: string;
    value: string;
}

declare global {
    interface Window {
        ethereum?: any;
    }
    }

interface AwardClass {
    label: string;
    value: string;
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
    ],
    templateUrl: './certificate-issue.html',
    styleUrls: ['./certificate-issue.scss']
})
export class IssueCertificateComponent implements OnInit {
    router = Router;
    fb = new FormBuilder();

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

    // Transaction details
    estimatedGasFee = signal<string>('0.0045');
    certificateNumber = signal<string>('Auto-generated');

    // Dropdown options
    qualificationTypes: QualificationType[] = [
        { label: 'Bachelor Degree', value: 'bachelor' },
        { label: 'Master Degree', value: 'master' },
        { label: 'Doctorate', value: 'doctorate' },
        { label: 'Diploma', value: 'diploma' },
        { label: 'Certificate', value: 'certificate' }
    ];

    awardClasses: AwardClass[] = [
        { label: 'First Class', value: 'first_class' },
        { label: 'Upper Second', value: 'upper_second' },
        { label: 'Lower Second', value: 'lower_second' },
        { label: 'Third Class', value: 'third_class' },
        { label: 'Pass', value: 'pass' },
        { label: 'Distinction', value: 'distinction' },
        { label: 'Merit', value: 'merit' }
    ];

    // Computed student name for summary
    studentName = computed(() => {
        return this.studentForm?.get('fullName')?.value || 'Munashe Keith Gandari';
    });

    ngOnInit() {
        this.initializeForms();
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts: string[]) => {
            if (accounts.length === 0) {
                this.walletConnected.set(false);
                this.walletAddress.set('');
            } else {
                this.walletAddress.set(accounts[0]);
            }
            });
        }
    }

    initializeForms() {
        // Step 1: Student Information
        this.studentForm = this.fb.group({
            studentId: ['', Validators.required],
            dateOfBirth: ['', Validators.required],
            fullName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
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
                return this.studentForm.valid;
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
        const file = event.files[0];
        if (file) {
            this.uploadedFile.set(file);
            this.documentForm.patchValue({ document: file.name });
            
            // Generate mock hash
            this.generateDocumentHash(file);
        }
    }

    onFileRemove() {
        this.uploadedFile.set(null);
        this.documentHash.set('');
        this.documentForm.patchValue({ document: '' });
    }

    generateDocumentHash(file: File) {
        // Mock hash generation (in production, calculate actual SHA-256)
        const mockHash = 'QmX7b8kFxNrLr8q3yd9YHJL7KXFjL8cWwYn2q2TzJm8K4f';
        this.documentHash.set(mockHash);
    }

    // AI Fraud Detection
    runAIAnalysis() {
        console.log('Running AI fraud detection analysis...');
        // Implement AI analysis logic
    }

    

    async connectWallet() {
    if (!window.ethereum) {
        alert('MetaMask is not installed. Please install it to continue.');
        return;
    }

    try {
        const accounts: string[] = await window.ethereum.request({
        method: 'eth_requestAccounts'
        });

        const address = accounts[0];

        this.walletConnected.set(true);
        this.walletAddress.set(address);

        this.blockchainForm.patchValue({
        walletConnected: true,
        walletAddress: address
        });

    } catch (error: any) {
        console.error('Wallet connection failed', error);
        this.walletConnected.set(false);
    }
    }

    disconnectWallet() {
        this.walletConnected.set(false);
        this.walletAddress.set('');
        this.blockchainForm.patchValue({ walletConnected: false });
    }

    // Submit to blockchain
    submitToBlockchain() {
        if (!this.walletConnected()) {
            console.error('Wallet not connected');
            return;
        }

        console.log('Submitting certificate to blockchain...');
        
        const certificateData = {
            student: this.studentForm.value,
            certificate: this.certificateForm.value,
            documentHash: this.documentHash(),
            timestamp: new Date().toISOString()
        };

        // Mock blockchain submission
        console.log('Certificate data:', certificateData);
        
        // Navigate back to certificates list
        // this.router.navigate(['/certificates']);
    }

    // Cancel and go back
    cancel() {
        // this.router.navigate(['/certificates']);
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
}