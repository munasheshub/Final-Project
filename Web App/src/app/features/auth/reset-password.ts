import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { AuthService } from '@/core/services/auth.service';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [ButtonModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, AppFloatingConfigurator, ToastModule],
    providers: [MessageService],
    template: `
    <p-toast></p-toast>
    <app-floating-configurator />
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen overflow-hidden">
      <div class="flex flex-col items-center justify-center">
        <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
          <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
            <div class="text-center mb-8">
              <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Reset Password</div>
              <span class="text-muted-color font-medium">Enter your new password</span>
            </div>

            <div>
              <label for="token" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Reset Token</label>
              <input pInputText id="token" type="text" placeholder="Reset token" class="w-full md:w-120 mb-4" [(ngModel)]="token" />

              <label for="password" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">New Password</label>
              <p-password id="password" placeholder="New password" [(ngModel)]="password" [toggleMask]="true" styleClass="mb-4" [fluid]="true" [feedback]="false"></p-password>

              <label for="confirmPassword" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Confirm Password</label>
              <p-password id="confirmPassword" placeholder="Confirm password" [(ngModel)]="confirmPassword" [toggleMask]="true" styleClass="mb-8" [fluid]="true" [feedback]="false"></p-password>

              <p-button label="Reset Password" styleClass="w-full" (onClick)="submit()"></p-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    `
})
export class ResetPassword {
    token: string = '';
    password: string = '';
    confirmPassword: string = '';
    isLoading: boolean = false;

    constructor(private authService: AuthService, private messageService: MessageService, private router: Router) {}

    submit(): void {
        if (!this.token || !this.password || !this.confirmPassword) {
            this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'All fields are required' });
            return;
        }

        if (this.password !== this.confirmPassword) {
            this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Passwords do not match' });
            return;
        }

        this.isLoading = true;
        this.authService.confirmPasswordReset({ token: this.token, newPassword: this.password, confirmPassword: this.confirmPassword }).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Password reset successfully' });
                this.router.navigate(['/auth/login']);
                this.isLoading = false;
            },
            error: (error: Error) => {
                this.messageService.add({ severity: 'error', summary: 'Failed', detail: error.message || 'Reset failed' });
                this.isLoading = false;
            }
        });
    }
}