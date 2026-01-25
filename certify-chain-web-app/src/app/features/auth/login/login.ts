// src/app/features/auth/login/login.component.ts

import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// PrimeNG v21
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    ToastModule,
    DividerModule,
    InputIconModule,
    IconFieldModule
  ],
  providers: [MessageService],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  loginForm!: FormGroup;
  loading = signal(false);
  showPassword = signal(false);
  
  // Carousel slides
  currentSlide = signal(0);
  slides = [
    {
      title: 'Secure Academic Verification',
      subtitle: 'Verify certificates with blockchain technology',
      image: 'assets/images/blockchain-security.jpg'
    },
    {
      title: 'AI-Powered Fraud Detection',
      subtitle: 'Advanced AI ensures certificate authenticity',
      image: 'assets/images/ai-detection.jpg'
    },
    {
      title: 'Instant Verification',
      subtitle: 'Verify academic credentials in seconds',
      image: 'assets/images/instant-verify.jpg'
    }
  ];

  ngOnInit(): void {
    this.initializeForm();
    this.startCarousel();
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  private startCarousel(): void {
    setInterval(() => {
      this.currentSlide.update(current => 
        (current + 1) % this.slides.length
      );
    }, 5000);
  }

  onSubmit(): void {
    if (!this.loginForm.valid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields correctly'
      });
      return;
    }

    this.loading.set(true);
    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Login successful! Redirecting...'
        });
        
        setTimeout(() => {
          const returnUrl = history.state?.returnUrl || '/dashboard';
          this.router.navigateByUrl(returnUrl);
        }, 1000);
      },
      error: (error) => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Login Failed',
          detail: error.message || 'Invalid email or password'
        });
      }
    });
  }

  loginWithGoogle(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Coming Soon',
      detail: 'Google authentication will be available soon'
    });
  }

  loginWithFacebook(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Coming Soon',
      detail: 'Facebook authentication will be available soon'
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(show => !show);
  }

  goToSlide(index: number): void {
    this.currentSlide.set(index);
  }
}