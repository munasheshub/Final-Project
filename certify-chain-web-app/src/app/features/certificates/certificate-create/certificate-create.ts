// src/app/features/certificates/certificate-create/certificate-create.component.ts

import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, switchMap } from 'rxjs';
import { MessageService } from 'primeng/api';
import { CertificateService } from '../services/certificate.service';
import { StudentService } from '../../../core/services/student.service';
import { Student, QualificationType, AwardClass, CertificateCreateDto } from '../../../core/models/certificate.model';


@Component({
  selector: 'app-certificate-create',
  templateUrl: './certificate-create.html',
  styleUrls: ['./certificate-create.scss'],
  standalone: false
})
export class CertificateCreateComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
    
  certificateForm!: FormGroup;
  currentStep = 0;
  
  // Loading states
  submitting = false;
  searchingStudent = false;
  uploadingFile = false;
  runningFraudCheck = false;
  loading = signal(true);
  checked = false;
  // Student search
  studentSearchResults: Student[] = [];
  selectedStudent: Student | null = null;

  // File upload
  uploadedFile: File | null = null;
  filePreviewUrl: string | null = null;

  // Fraud detection
  fraudCheckResult: any = null;
  fraudCheckScore: number = 0;

  // Dropdown options
  qualificationTypes = Object.values(QualificationType).map(type => ({
    label: type,
    value: type
  }));

  awardClasses = Object.values(AwardClass).map(cls => ({
    label: cls,
    value: cls
  }));

  // Available signatures (would come from API)
  availableSignatures = [
    { label: 'Dr. John Smith - Registrar', value: 'sig_001' },
    { label: 'Prof. Jane Doe - Vice Chancellor', value: 'sig_002' },
    { label: 'Mr. Bob Johnson - Dean', value: 'sig_003' }
  ];

  // Steps
  steps = [
    { label: 'Student Details' },
    { label: 'Certificate Information' },
    { label: 'Document Upload' },
    { label: 'Review & Submit' }
  ];

  constructor(
    private fb: FormBuilder,
    private certificateService: CertificateService,
    private studentService: StudentService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setupStudentSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize form with validation
   */
  private initializeForm(): void {
    this.certificateForm = this.fb.group({
      // Student Details
      studentSearch: [''],
      studentId: ['', Validators.required],
      studentName: [{ value: '', disabled: true }],
      studentEmail: [{ value: '', disabled: true }],

      // Certificate Information
      qualificationType: ['', Validators.required],
      programName: ['', [Validators.required, Validators.minLength(3)]],
      specialization: [''],
      awardClass: ['', Validators.required],
      graduationDate: ['', Validators.required],

      // Document & Signature
      signatureId: ['', Validators.required],
      performFraudCheck: [true],

      // Additional notes
      notes: ['']
    });
  }

  /**
   * Setup student search with debounce
   */
  private setupStudentSearch(): void {
    this.certificateForm.get('studentSearch')?.valueChanges
      .pipe(
        debounceTime(500),
        switchMap(searchText => {
          if (!searchText || searchText.length < 2) {
            this.studentSearchResults = [];
            return [];
          }
          this.searchingStudent = true;
          return this.studentService.searchStudents(searchText);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (students) => {
          this.studentSearchResults = students;
          this.searchingStudent = false;
        },
        error: () => {
          this.searchingStudent = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to search students'
          });
        }
      });
  }

  /**
   * Select student from search results
   */
  selectStudent(student: Student): void {
    this.selectedStudent = student;
    this.certificateForm.patchValue({
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      studentEmail: student.email
    });
    this.studentSearchResults = [];
  }

  /**
   * Handle file upload
   */
  onFileSelect(event: any): void {
    const file = event.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid File',
        detail: 'Please upload PDF, JPEG, or PNG file'
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.messageService.add({
        severity: 'error',
        summary: 'File Too Large',
        detail: 'Maximum file size is 5MB'
      });
      return;
    }

    this.uploadedFile = file;
    this.generatePreview(file);

    // Run fraud check if enabled
    if (this.certificateForm.get('performFraudCheck')?.value) {
      this.runFraudDetection(file);
    }
  }

  /**
   * Generate file preview
   */
  private generatePreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.filePreviewUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  /**
   * Run AI fraud detection
   */
  private runFraudDetection(file: File): void {
    this.runningFraudCheck = true;

    // Simulated fraud detection - replace with actual service call
    setTimeout(() => {
      this.fraudCheckScore = Math.random() * 100;
      this.fraudCheckResult = {
        result: this.fraudCheckScore > 85 ? 'AUTHENTIC' : 
                this.fraudCheckScore > 50 ? 'SUSPICIOUS' : 'FRAUDULENT',
        score: this.fraudCheckScore,
        details: {
          signatureCheck: this.fraudCheckScore > 80,
          layoutCheck: this.fraudCheckScore > 70,
          textConsistency: this.fraudCheckScore > 75
        }
      };
      this.runningFraudCheck = false;

      if (this.fraudCheckResult.result === 'FRAUDULENT') {
        this.messageService.add({
          severity: 'warn',
          summary: 'Fraud Alert',
          detail: 'Document appears to be fraudulent. Please review carefully.'
        });
      }
    }, 2000);
  }

  /**
   * Clear uploaded file
   */
  clearFile(): void {
    this.uploadedFile = null;
    this.filePreviewUrl = null;
    this.fraudCheckResult = null;
    this.fraudCheckScore = 0;
  }

  /**
   * Navigate to next step
   */
  nextStep(): void {
    if (!this.validateCurrentStep()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields'
      });
      return;
    }

    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
    }
  }

  /**
   * Navigate to previous step
   */
  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  /**
   * Validate current step
   */
  private validateCurrentStep(): boolean {
    switch (this.currentStep) {
      case 0: // Student Details
        return this.certificateForm.get('studentId')?.valid ?? false;
      
      case 1: // Certificate Information
        return (
          this.certificateForm.get('qualificationType')?.valid &&
          this.certificateForm.get('programName')?.valid &&
          this.certificateForm.get('awardClass')?.valid &&
          this.certificateForm.get('graduationDate')?.valid
        ) ?? false;
      
      case 2: // Document Upload
        return this.uploadedFile !== null &&
               (this.certificateForm.get('signatureId')?.valid ?? false);
      
      case 3: // Review
        return true;
      
      default:
        return false;
    }
  }

  /**
   * Submit certificate
   */
  submitCertificate(): void {
    if (!this.certificateForm.valid || !this.uploadedFile) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please complete all required fields'
      });
      return;
    }

    this.submitting = true;

    const formValue = this.certificateForm.getRawValue();
    const certificateData: CertificateCreateDto = {
      studentId: formValue.studentId,
      qualificationType: formValue.qualificationType,
      programName: formValue.programName,
      specialization: formValue.specialization,
      awardClass: formValue.awardClass,
      graduationDate: new Date(formValue.graduationDate),
      documentFile: this.uploadedFile,
      signatureId: formValue.signatureId,
      performFraudCheck: formValue.performFraudCheck
    };

    this.certificateService.createCertificate(certificateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (certificate) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Certificate issued successfully'
          });
          
          setTimeout(() => {
            this.router.navigate(['/certificates', certificate.id]);
          }, 1500);
        },
        error: (error) => {
          this.submitting = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to issue certificate'
          });
        }
      });
  }

  /**
   * Reset form
   */
  resetForm(): void {
    this.certificateForm.reset();
    this.currentStep = 0;
    this.selectedStudent = null;
    this.clearFile();
  }

  /**
   * Get fraud severity
   */
  getFraudSeverity(): 'success' | 'warn' | 'danger' {
    if (this.fraudCheckScore > 85) return 'success';
    if (this.fraudCheckScore > 50) return 'warn';
    return 'danger';
  }

  /**
   * Cancel and go back
   */
  cancel(): void {
    this.router.navigate(['/certificates']);
  }
}