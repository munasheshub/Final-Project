import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { AuthService } from '@/core/services/auth.service';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [ButtonModule, InputTextModule, FormsModule, RouterModule, RippleModule, AppFloatingConfigurator, ToastModule],
    providers: [MessageService],
    template: `
    <p-toast></p-toast>
    <app-floating-configurator />
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen overflow-hidden">
      <div class="flex flex-col items-center justify-center">
        <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
          <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
            <div class="text-center mb-8">
              <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Forgot Password</div>
              <span class="text-muted-color font-medium">Enter your email to reset password</span>
            </div>

            <div>
              <label for="email" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
              <input pInputText id="email" type="text" placeholder="Email address" class="w-full md:w-120 mb-8" [(ngModel)]="email" />

              <p-button label="Send Reset Link" styleClass="w-full" (onClick)="submit()"></p-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    `
})
export class ForgotPassword {
    email: string = '';
    isLoading: boolean = false;

    constructor(private authService: AuthService, private messageService: MessageService) {}

    submit(): void {
        if (!this.email) {
            this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Email is required' });
            return;
        }

        this.isLoading = true;
        this.authService.requestPasswordReset({ email: this.email }).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Password reset email sent' });
                this.isLoading = false;
            },
            error: (error: Error) => {
                this.messageService.add({ severity: 'error', summary: 'Failed', detail: error.message || 'Error sending email' });
                this.isLoading = false;
            }
        });
    }
}