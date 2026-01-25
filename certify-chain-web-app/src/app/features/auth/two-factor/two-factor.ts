import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputOtpModule } from 'primeng/inputotp';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-two-factor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    InputOtpModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './two-factor.html',
  styleUrl: './two-factor.scss'
})
export class TwoFactorComponent {
  twoFactorForm: FormGroup;
  loading = signal(false);
  resendLoading = signal(false);
  resendCooldown = signal(0);

  private cooldownInterval: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private messageService: MessageService
  ) {
    this.twoFactorForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.twoFactorForm.valid) {
      this.loading.set(true);
      
      // Simulate API call
      setTimeout(() => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Verified',
          detail: 'Two-factor authentication successful'
        });
        // Navigate to dashboard or intended route
        // this.router.navigate(['/dashboard']);
      }, 1500);
    }
  }

  resendCode(): void {
    if (this.resendCooldown() > 0) return;

    this.resendLoading.set(true);

    // Simulate API call
    setTimeout(() => {
      this.resendLoading.set(false);
      this.resendCooldown.set(60);
      this.startCooldown();
      this.messageService.add({
        severity: 'info',
        summary: 'Code Sent',
        detail: 'A new verification code has been sent to your device'
      });
    }, 1000);
  }

  private startCooldown(): void {
    this.cooldownInterval = setInterval(() => {
      const current = this.resendCooldown();
      if (current <= 1) {
        this.resendCooldown.set(0);
        clearInterval(this.cooldownInterval);
      } else {
        this.resendCooldown.set(current - 1);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.cooldownInterval) {
      clearInterval(this.cooldownInterval);
    }
  }
}