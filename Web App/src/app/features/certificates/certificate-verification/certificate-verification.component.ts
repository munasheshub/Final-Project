import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { BlockchainService } from '@/core/services/blockchain.service';
import { VerificationLogResponseDto, VerificationLogService } from '../services/verification-log.service';
import { CertificateService, CertificateApiResponse } from '../services/certificate.service';
import { InstitutionService } from '@/core/services/institution.service';
import { InstitutionDto } from '@/core/models/institution.model';
import { firstValueFrom } from 'rxjs';
import jsQR from 'jsqr';

@Component({
  selector: 'app-certificate-verification',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './certificate-verification.component.html',
  styleUrl: './certificate-verification.component.scss'
})
export class CertificateVerificationComponent implements OnInit {
  private verificationLogService = inject(VerificationLogService);
  private blockchainService = inject(BlockchainService);
  private certificateService = inject(CertificateService);
  private institutionService = inject(InstitutionService);
  private messageService = inject(MessageService);

  verificationMode = signal<'QR' | 'HASH'>('QR');
  qrCodeValue = '';
  certificateHashValue = '';
  verifying = signal(false);
  decodingQr = signal(false);
  selectedQrFile: File | null = null;
  resultLogs = signal<VerificationLogResponseDto[]>([]);
  myLogs = signal<VerificationLogResponseDto[]>([]);
  loadingMyLogs = signal(false);
  
  // Verification result data
  blockchainData = signal<any>(null);
  certificateData = signal<CertificateApiResponse | null>(null);
  institutionData = signal<InstitutionDto | null>(null);
  showResults = signal(false);

  ngOnInit(): void {
    this.loadMyVerificationLogs();
  }

  setMode(mode: 'QR' | 'HASH'): void {
    this.verificationMode.set(mode);
  }

  async onQrFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    this.selectedQrFile = file;
    
    if (file) {
      await this.decodeUploadedQr();
    }
  }

  async decodeUploadedQr(): Promise<void> {
    if (!this.selectedQrFile) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No File Selected',
        detail: 'Please select a QR code image to decode.'
      });
      return;
    }

    this.decodingQr.set(true);

    try {
      const decodedValue = await this.decodeQrFromFile(this.selectedQrFile);
      if (!decodedValue) {
        this.messageService.add({
          severity: 'warn',
          summary: 'QR Not Detected',
          detail: 'No QR code was detected in the uploaded image.'
        });
        return;
      }

      this.qrCodeValue = decodedValue;
      this.messageService.add({
        severity: 'success',
        summary: 'QR Decoded',
        detail: 'QR code decoded successfully. You can now verify the certificate.'
      });
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Decode Failed',
        detail: error?.message || 'Failed to decode QR code image.'
      });
    } finally {
      this.decodingQr.set(false);
    }
  }

  async verify(): Promise<void> {
    const mode = this.verificationMode();
    const inputValue = mode === 'QR' ? this.qrCodeValue : this.certificateHashValue;
    const certificateHash = this.extractCertificateHash(inputValue);

    if (!certificateHash) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Invalid Input',
        detail: mode === 'QR' ? 'Enter valid QR data containing certificate hash.' : 'Enter a certificate hash.'
      });
      return;
    }

    this.verifying.set(true);

    try {
      const onChainResult = await this.blockchainService.verifyCertificateOnChain(certificateHash);
      const isSuccess = !!onChainResult.isValid;
      const failureReason = isSuccess ? undefined : 'Certificate is not valid on blockchain.';

      if (isSuccess) {
        // Store blockchain data
        this.blockchainData.set(onChainResult);
        
        // Fetch institution details
        try {
          const instResponse = await firstValueFrom(this.institutionService.getInstitutionById(onChainResult.institutionId));
          if (instResponse.isSuccess && instResponse.data) {
            this.institutionData.set(instResponse.data);
          }
        } catch (instError) {
          console.error('Failed to fetch institution:', instError);
        }
        
        // Fetch certificate details
        try {
          const certResponse = await firstValueFrom(this.certificateService.getCertificateByCertHash(certificateHash));
          if (certResponse.isSuccess && certResponse.data) {
            this.certificateData.set(certResponse.data);
          }
        } catch (certError) {
          console.error('Failed to fetch certificate:', certError);
        }
        
        this.showResults.set(true);
      } else {
        this.showResults.set(false);
        this.blockchainData.set(null);
        this.certificateData.set(null);
        this.institutionData.set(null);
      }

      await this.createLog(certificateHash, isSuccess, failureReason);
      await this.loadLogs(certificateHash);
      await this.loadMyVerificationLogs();

      this.messageService.add({
        severity: isSuccess ? 'success' : 'warn',
        summary: isSuccess ? 'Verified on Blockchain' : 'Verification Failed',
        detail: isSuccess
          ? 'Certificate hash is valid on blockchain.'
          : (failureReason || 'Certificate could not be validated on blockchain.')
      });
    } catch (error: any) {
      const failureReason = error?.message || 'Failed to verify certificate on blockchain.';
      
      this.showResults.set(false);
      this.blockchainData.set(null);
      this.certificateData.set(null);
      this.institutionData.set(null);

      await this.createLog(certificateHash, false, failureReason);
      await this.loadLogs(certificateHash);
      await this.loadMyVerificationLogs();

      this.messageService.add({
        severity: 'error',
        summary: 'Verification Failed',
        detail: failureReason
      });
    } finally {
      this.verifying.set(false);
    }
  }

  private async createLog(certificateHash: string, isSuccess: boolean, failureReason?: string): Promise<void> {
    try {
      await firstValueFrom(this.verificationLogService.createVerificationLog({
        certificateHash,
        isSuccess,
        failureReason
      }));
    } catch (error) {
      console.error('Failed to create verification log:', error);
    }
  }

  private async loadLogs(certificateHash: string): Promise<void> {
    try {
      const response = await firstValueFrom(this.verificationLogService.getByCertificateHash(certificateHash));
      this.resultLogs.set(response.data ?? []);
    } catch (error) {
      console.error('Failed to load verification logs:', error);
      this.resultLogs.set([]);
    }
  }

  private async loadMyVerificationLogs(): Promise<void> {
    this.loadingMyLogs.set(true);
    try {
      const response = await firstValueFrom(this.verificationLogService.getMyVerificationLogs());
      this.myLogs.set(response.data ?? []);
    } catch (error) {
      console.error('Failed to load my verification logs:', error);
      this.myLogs.set([]);
    } finally {
      this.loadingMyLogs.set(false);
    }
  }

  private decodeQrFromFile(file: File): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Could not create canvas context.'));
            return;
          }

          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          resolve(code?.data || null);
        };
        img.onerror = () => reject(new Error('Failed to load image.'));
        img.src = reader.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsDataURL(file);
    });
  }

  private extractCertificateHash(input: string): string | null {
    const trimmed = input?.trim();
    if (!trimmed) {
      return null;
    }

    if (this.looksLikeHash(trimmed)) {
      return trimmed;
    }

    try {
      const parsed = new URL(trimmed);
      const possibleHash =
        parsed.searchParams.get('certificateHash') ||
        parsed.searchParams.get('certHash') ||
        parsed.searchParams.get('hash') ||
        parsed.pathname.split('/').filter(Boolean).at(-1) ||
        '';

      if (this.looksLikeHash(possibleHash)) {
        return possibleHash;
      }
    } catch {
      // not a URL; fall through
    }

    return null;
  }

  private looksLikeHash(value: string): boolean {
    return /^0x[a-fA-F0-9]{64}$/.test(value.trim());
  }

  formatDate(value?: string): string {
    if (!value) {
      return 'N/A';
    }

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(value));
  }

  formatTimestamp(timestamp: number): string {
    try {
      // Convert Unix timestamp (seconds) to milliseconds
      const date = new Date(timestamp * 1000);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return 'Invalid date';
    }
  }
}
