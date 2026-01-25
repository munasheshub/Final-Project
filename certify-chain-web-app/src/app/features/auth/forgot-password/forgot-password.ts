import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  loading = signal(false);
  emailSent = signal(false);
  submittedEmail = signal('');

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private messageService: MessageService
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotForm.valid) {
      this.loading.set(true);
      const email = this.forgotForm.get('email')?.value;

      // Simulate API call
      setTimeout(() => {
        this.loading.set(false);
        this.submittedEmail.set(email);
        this.emailSent.set(true);
        this.messageService.add({
          severity: 'success',
          summary: 'Email Sent',
          detail: 'Password reset instructions have been sent'
        });
      }, 1500);
    }
  }

  resendEmail(): void {
    this.loading.set(true);

    setTimeout(() => {
      this.loading.set(false);
      this.messageService.add({
        severity: 'info',
        summary: 'Email Resent',
        detail: 'A new reset link has been sent to your email'
      });
    }, 1000);
  }

  tryDifferentEmail(): void {
    this.emailSent.set(false);
    this.forgotForm.reset();
  }
}