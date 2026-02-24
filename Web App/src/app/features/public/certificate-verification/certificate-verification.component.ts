import { CommonModule } from '@angular/common';
import { Component, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { BlockchainService } from '@/core/services/blockchain.service';

@Component({
  selector: 'app-certificate-verification',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    MessageModule,
    TagModule,
    ToastModule,
    TooltipModule
  ],
  providers: [MessageService],
  templateUrl: './certificate-verification.component.html',
  styleUrls: ['./certificate-verification.component.scss']
})
export class CertificateVerificationComponent {
  blockchainService = inject(BlockchainService);
  messageService = inject(MessageService);
  fb = inject(FormBuilder);

  verificationForm!: FormGroup;
  isVerifying = signal(false);
  verificationResult = signal<any>(null);
  showResult = signal(false);

  constructor() {
    this.initializeForm();
  }

  initializeForm() {
    this.verificationForm = this.fb.group({
      certHash: ['', [
        Validators.required,
        Validators.pattern(/^0x[a-fA-F0-9]{64}$/)
      ]]
    });
  }

  async verifyCertificate() {
    if (!this.verificationForm.valid) return;

    this.isVerifying.set(true);
    this.showResult.set(false);

    try {
      const certHash = this.verificationForm.value.certHash;
      
      // Verify certificate on blockchain
      const result = await this.blockchainService.verifyCertificateOnChain(certHash);
      
      // Get full details
      const details = await this.blockchainService.getCertificateDetails(certHash);
      
      this.verificationResult.set({
        ...result,
        ...details,
        certHash
      });
      
      this.showResult.set(true);

      if (result.isValid) {
        this.messageService.add({
          severity: 'success',
          summary: 'Valid Certificate',
          detail: 'This certificate is authentic and verified on the blockchain'
        });
      } else {
        this.messageService.add({
          severity: 'warn',
          summary: 'Invalid Certificate',
          detail: details.status === 2 ? 'This certificate has been revoked' : 'This certificate is not valid'
        });
      }
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Verification Failed',
        detail: error.message || 'Failed to verify certificate'
      });
      this.showResult.set(false);
    } finally {
      this.isVerifying.set(false);
    }
  }

  reset() {
    this.verificationForm.reset();
    this.showResult.set(false);
    this.verificationResult.set(null);
  }

  getStatusText(status: number): string {
    switch (status) {
      case 0: return 'Invalid';
      case 1: return 'Valid';
      case 2: return 'Revoked';
      default: return 'Unknown';
    }
  }

  getStatusSeverity(status: number): 'success' | 'warn' | 'danger' {
    switch (status) {
      case 1: return 'success';
      case 2: return 'warn';
      default: return 'danger';
    }
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  bytes16ToString(bytes16: string): string {
    try {
      // Remove 0x prefix
      let hex = bytes16.replace('0x', '');
      
      // Convert hex to string
      let result = '';
      for (let i = 0; i < hex.length; i += 2) {
        const hexPair = hex.substr(i, 2);
        if (hexPair === '00') break;
        const charCode = parseInt(hexPair, 16);
        if (charCode > 0) {
          result += String.fromCharCode(charCode);
        }
      }
      return result || 'N/A';
    } catch {
      return 'N/A';
    }
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    this.messageService.add({
      severity: 'info',
      summary: 'Copied',
      detail: 'Copied to clipboard'
    });
  }

  viewOnExplorer(hash: string) {
    const explorerUrl = `https://sepolia.etherscan.io/tx/${hash}`;
    window.open(explorerUrl, '_blank');
  }
}
