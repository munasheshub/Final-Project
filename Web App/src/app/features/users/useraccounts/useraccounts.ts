import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { PasswordModule } from 'primeng/password';
import { User, RegisterDto, UserRole, getUserRoleLabel, getUserRoleSeverity, Permission } from '@/core/models/user.model';
import { UserService } from '@/core/services/user.service';
import { InstitutionDto } from '@/core/models/institution.model';
import { InstitutionService } from '@/core/services/institution.service';
import { AuthService } from '@/core/services/auth.service';

@Component({
    selector: 'app-useraccounts',
    standalone: true,
    providers: [MessageService],
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        CardModule,
        TableModule,
        InputTextModule,
        TagModule,
        IconFieldModule,
        InputIconModule,
        DialogModule,
        ToastModule,
        TooltipModule,
        SelectModule,
        PasswordModule
    ],
    templateUrl: './useraccounts.html',
    styleUrls: ['./useraccounts.scss']
})
export class UserAccountsComponent implements OnInit {
    users = signal<User[]>([]);
    institutions = signal<InstitutionDto[]>([]);
    user: RegisterDto = {
        tenantId: '',
        email: '',
        role: UserRole.Registrar,
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: ''
    };
    selectedUser: User | null = null;
    searchValue = signal<string>('');
    userService = inject(UserService);
    institutionService = inject(InstitutionService);
    messageService = inject(MessageService);
    private authService = inject(AuthService);
    canCreate = this.authService.hasPermission(Permission.USER_CREATE);
    canDelete = this.authService.hasPermission(Permission.USER_DELETE);
    visible = signal(false);
    viewModalVisible = signal(false);
    isEditMode = signal(false);

    // Role options for dropdown
    roleOptions = [
        { label: 'Institution Admin', value: UserRole.InstitutionAdmin },
        { label: 'Registrar', value: UserRole.Registrar },
        { label: 'Verification Officer', value: UserRole.VerificationOfficer },
        { label: 'Auditor', value: UserRole.Auditor }
    ];

    // Filtered users based on search
    filteredUsers = computed<User[]>(() => {
        let filtered = this.users();

        // Filter by search
        const search = this.searchValue().toLowerCase();
        if (search) {
            filtered = filtered.filter(u => 
                u.firstName.toLowerCase().includes(search) ||
                u.lastName.toLowerCase().includes(search) ||
                u.email.toLowerCase().includes(search) ||
                getUserRoleLabel(u.role).toLowerCase().includes(search) ||
                (u.tenantId && u.tenantId.toLowerCase().includes(search))
            );
        }
        
        return filtered;
    });

    ngOnInit() {
        this.loadUsers();
        this.loadInstitutions();
    }

    loadUsers() {
        this.userService.getAllUsers().subscribe({
            next: (users) => {
                this.users.set(users.data ?? []);
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message || 'Failed to load users'
                });
            }
        });
    }

    loadInstitutions() {
        this.institutionService.getAllInstitutions().subscribe({
            next: (response) => {
                if (response.isSuccess) {
                    this.institutions.set(response.data ?? []);
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load institutions'
                    });
                }
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message || 'Failed to load institutions'
                });
            }
        });
    }

    formatDate(date: Date | string): string {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
        }).format(dateObj);
    }

    getInitials(user: User): string {
        return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }

    getAvatarColor(name: string): string {
        const colors = [
            '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', 
            '#10b981', '#06b6d4', '#6366f1', '#ef4444',
            '#14b8a6', '#f97316'
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    }

    getAvatarColorSecondary(name: string): string {
        const colors = [
            '#60a5fa', '#a78bfa', '#f472b6', '#fbbf24',
            '#34d399', '#22d3ee', '#818cf8', '#f87171',
            '#2dd4bf', '#fb923c'
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    }

    getRoleSeverity(role: UserRole): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        return getUserRoleSeverity(role);
    }

    getRoleLabel(role: UserRole): string {
        return getUserRoleLabel(role);
    }

    getInstitutionName(tenantId?: string): string {
        if (!tenantId) {
            return 'Global / Super Admin';
        }
        const institution = this.institutions().find(i => i.subdomain === tenantId);
        return institution?.name || 'Unknown';
    }

    onSearch(event: any) {
        this.searchValue.set(event.target.value);
    }

    // Show modal for creating new user
    show() {
        this.isEditMode.set(false);
        this.user = {
            tenantId: '',
            email: '',
            role: UserRole.Registrar,
            firstName: '',
            lastName: '',
            password: '',
            confirmPassword: ''
        };
        this.visible.set(true);
    }

    // Hide modal
    hide() {
        this.visible.set(false);
        this.selectedUser = null;
    }

    // Submit form
    onSubmit() {
        if (this.isEditMode()) {
            // Update not implemented in this version
            this.messageService.add({
                severity: 'info',
                summary: 'Not Implemented',
                detail: 'User update functionality not implemented yet'
            });
        } else {
            this.createUser();
        }
    }

    createUser() {
        // Create payload with trimmed values (don't mutate bound properties)
        const payload: RegisterDto = {
            tenantId: this.user.tenantId?.trim() || '',
            email: this.user.email?.trim() || '',
            firstName: this.user.firstName?.trim() || '',
            lastName: this.user.lastName?.trim() || '',
            password: this.user.password,
            confirmPassword: this.user.confirmPassword,
            role: this.user.role
        };

        // Validate required fields
        if (!payload.tenantId) {
            this.messageService.add({
                severity: 'error',
                summary: 'Validation Error',
                detail: 'Please select an institution'
            });
            return;
        }

        if (!payload.firstName || !payload.lastName) {
            this.messageService.add({
                severity: 'error',
                summary: 'Validation Error',
                detail: 'First name and last name are required'
            });
            return;
        }

        if (!payload.email) {
            this.messageService.add({
                severity: 'error',
                summary: 'Validation Error',
                detail: 'Email is required'
            });
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(payload.email)) {
            this.messageService.add({
                severity: 'error',
                summary: 'Validation Error',
                detail: 'Please enter a valid email address'
            });
            return;
        }

        if (!payload.password || !payload.confirmPassword) {
            this.messageService.add({
                severity: 'error',
                summary: 'Validation Error',
                detail: 'Password and confirm password are required'
            });
            return;
        }

        // Validate password length
        if (payload.password.length < 6) {
            this.messageService.add({
                severity: 'error',
                summary: 'Validation Error',
                detail: 'Password must be at least 6 characters long'
            });
            return;
        }

        // Validate passwords match
        if (payload.password !== payload.confirmPassword) {
            this.messageService.add({
                severity: 'error',
                summary: 'Validation Error',
                detail: 'Passwords do not match'
            });
            return;
        }

        // Log the request payload for debugging
        console.log('Creating user with data:', {
            ...payload,
            password: '[REDACTED]',
            confirmPassword: '[REDACTED]'
        });

        this.userService.createUserAccount(payload).subscribe({
            next: (response) => {
                if (response.isSuccess && response.data) {
                    this.hide();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'User created successfully'
                    });
                    this.loadUsers();
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: response.message || 'Failed to create user'
                    });
                }
            },
            error: (error: any) => {
                console.error('User creation error:', error);
                
                let errorMessage = 'An error occurred';
                
                // Handle validation errors from backend
                if (error.error?.errors) {
                    const errors = error.error.errors;
                    const errorMessages: string[] = [];
                    
                    Object.entries(errors).forEach(([key, value]) => {
                        if (Array.isArray(value)) {
                            errorMessages.push(...value);
                        }
                    });
                    
                    errorMessage = errorMessages.join(', ');
                } else if (error.error?.title) {
                    errorMessage = error.error.title;
                } else if (error.message) {
                    errorMessage = error.message;
                }

                this.messageService.add({
                    severity: 'error',
                    summary: 'User Creation Failed',
                    detail: errorMessage
                });
            }
        });
    }

    // Cancel and close
    onCancel() {
        this.hide();
    }

    viewDetails(user?: User) {
        const userToView = user || this.selectedUser;
        if (userToView) {
            this.selectedUser = userToView;
            this.viewModalVisible.set(true);
        }
    }

    hideViewModal() {
        this.viewModalVisible.set(false);
        this.selectedUser = null;
    }

    deleteUser(user?: User) {
        const userToDelete = user || this.selectedUser;
        if (userToDelete && userToDelete.id) {
            if (confirm(`Are you sure you want to delete ${userToDelete.firstName} ${userToDelete.lastName}?`)) {
                this.userService.deleteUser(userToDelete.id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'User deleted successfully'
                        });
                        this.loadUsers();
                    },
                    error: (error: Error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Delete Failed',
                            detail: error.message || 'An error occurred'
                        });
                    }
                });
            }
        }
    }
}
