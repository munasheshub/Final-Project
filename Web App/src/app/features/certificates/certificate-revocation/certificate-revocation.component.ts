import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { BlockchainService } from '../../../core/services/blockchain.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-certificate-revocation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ToastModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    MessageModule,
    TagModule
  ],
  providers: [MessageService],
  templateUrl: './certificate-revocation.component.html',
  styleUrl: './certificate-revocation.component.scss'
})
export class CertificateRevocationComponent {
  private blockchainService = inject(BlockchainService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);

  // State
  walletAddress = signal<string | null>(null);
  isConnecting = signal<boolean>(false);
  isRevoking = signal<boolean>(false);
  showConfirmDialog = signal<boolean>(false);

  // Form
  revocationForm: FormGroup;

  // Computed
  isWalletConnected = computed(() => this.walletAddress() !== null);

  constructor() {
    this.revocationForm = this.fb.group({
      certHash: ['', [
        Validators.required,
        Validators.pattern(/^0x[a-fA-F0-9]{64}$/)
      ]],
      reason: ['', [Validators.maxLength(500)]]
    });
  }

  /**
   * Connect to MetaMask wallet
   */
  async connectWallet(): Promise<void> {
    this.isConnecting.set(true);
    try {
      const connection = await firstValueFrom(this.blockchainService.connectWallet());
      if (connection && connection.isConnected) {
        this.walletAddress.set(connection.address);
        this.messageService.add({
          severity: 'success',
          summary: 'Wallet Connected',
          detail: `Connected to ${this.formatAddress(connection.address)}`
        });
      }
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Connection Failed',
        detail: error.message || 'Failed to connect to MetaMask wallet'
      });
    } finally {
      this.isConnecting.set(false);
    }
  }

  /**
   * Show confirmation dialog
   */
  showRevocationConfirm(): void {
    if (this.revocationForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Invalid Input',
        detail: 'Please enter a valid certificate hash'
      });
      Object.keys(this.revocationForm.controls).forEach(key => {
        this.revocationForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.showConfirmDialog.set(true);
  }

  /**
   * Revoke certificate on blockchain
   */
  async revokeCertificate(): Promise<void> {
    if (!this.walletAddress()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Wallet Not Connected',
        detail: 'Please connect your institution wallet first'
      });
      return;
    }

    if (this.revocationForm.invalid) {
      return;
    }

    this.isRevoking.set(true);
    this.showConfirmDialog.set(false);

    try {
      const certHash = this.revocationForm.value.certHash;
      const receipt = await this.blockchainService.revokeCertificate(certHash);

      this.messageService.add({
        severity: 'success',
        summary: 'Certificate Revoked',
        detail: `Certificate ${this.formatHash(certHash)} has been successfully revoked`,
        life: 5000
      });

      console.log('Revocation receipt:', receipt);

      // Reset form
      this.revocationForm.reset();

    } catch (error: any) {
      console.error('Certificate revocation error:', error);
      
      let errorMessage = 'Failed to revoke certificate';
      
      if (error.message?.includes('execution reverted')) {
        errorMessage = 'Only the issuing institution can revoke this certificate. Make sure you are using the correct wallet.';
      } else if (error.message?.includes('user rejected')) {
        errorMessage = 'Transaction was rejected by user';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for gas fee';
      } else if (error.message) {
        errorMessage = error.message;
      }

      this.messageService.add({
        severity: 'error',
        summary: 'Revocation Failed',
        detail: errorMessage,
        life: 7000
      });
    } finally {
      this.isRevoking.set(false);
    }
  }

  /**
   * Cancel revocation
   */
  cancelRevocation(): void {
    this.showConfirmDialog.set(false);
  }

  /**
   * Verify certificate before revoking (optional check)
   */
  async checkCertificate(): Promise<void> {
    const certHash = this.revocationForm.get('certHash')?.value;
    
    if (!certHash || this.revocationForm.get('certHash')?.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Invalid Hash',
        detail: 'Please enter a valid certificate hash'
      });
      return;
    }

    try {
      const details = await this.blockchainService.getCertificateDetails(certHash);
      
      if (details.status === 0) {
        this.messageService.add({
          severity: 'error',
          summary: 'Certificate Not Found',
          detail: 'This certificate does not exist on the blockchain'
        });
      } else if (details.status === 2) {
        this.messageService.add({
          severity: 'info',
          summary: 'Already Revoked',
          detail: 'This certificate is already revoked'
        });
      } else if (details.status === 1) {
        this.messageService.add({
          severity: 'success',
          summary: 'Certificate Found',
          detail: `Valid certificate issued by institution ${details.institutionId}`,
          life: 5000
        });
      }
    } catch (error: any) {
      console.error('Certificate check error:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Check Failed',
        detail: error.message || 'Failed to verify certificate status'
      });
    }
  }

  /**
   * Format wallet address for display
   */
  formatAddress(address: string): string {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }

  /**
   * Format hash for display
   */
  formatHash(hash: string): string {
    if (!hash) return '';
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;
  }
}
