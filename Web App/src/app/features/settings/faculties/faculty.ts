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
import { FacultyDto, CreateFacultyRequest, UpdateFacultyRequest } from '@/core/models/faculty.model';
import { FacultyService } from '@/core/services/faculty.service';
import { InstitutionService } from '@/core/services/institution.service';
import { AuthService } from '@/core/services/auth.service';
import { Permission } from '@/core/models/user.model';

@Component({
    selector: 'app-faculties',
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
        TooltipModule
    ],
    templateUrl: './faculty.html',
    styleUrls: ['./faculty.scss']
})
export class FacultyComponent implements OnInit {
    faculties = signal<FacultyDto[]>([]);
    faculty: Partial<FacultyDto> = {};
    selectedFaculty: FacultyDto | null = null;
    searchValue = signal<string>('');
    facultyService = inject(FacultyService);
    institutionService = inject(InstitutionService);
    messageService = inject(MessageService);
    private authService = inject(AuthService);
    canManage = this.authService.hasPermission(Permission.FACULTY_MANAGE);
    institutionId = signal<number>(1);
    visible = signal(false);
    viewModalVisible = signal(false);
    isEditMode = signal(false);

    // Filtered faculties based on search
    filteredFaculties = computed<FacultyDto[]>(() => {
        let filtered = this.faculties();

        // Filter by search
        const search = this.searchValue().toLowerCase();
        if (search) {
            filtered = filtered.filter(f => 
                f.name.toLowerCase().includes(search) ||
                f.code.toLowerCase().includes(search)
            );
        }
        
        return filtered;
    });

    ngOnInit() {
        this.loadMyInstitution();
        this.loadFaculties();
    }

    loadMyInstitution() {
        this.institutionService.getMyInstitution().subscribe({
            next: (response) => {
                if (response.isSuccess && response.data && response.data.id) {
                    this.institutionId.set(response.data.id);
                }
            },
            error: (error) => {
                console.error('Failed to load institution:', error);
                // Keep default institution ID of 1 if fetch fails
            }
        });
    }

    loadFaculties() {
        this.facultyService.getAllFaculties().subscribe({
            next: (response) => {
                if (response.isSuccess) {
                    this.faculties.set(response.data ?? []);
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load faculties'
                    });
                }
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message || 'Failed to load faculties'
                });
            }
        });
    }

    getCodeInitials(code: string): string {
        return code.substring(0, 2).toUpperCase();
    }

    getAvatarColor(code: string): string {
        const colors = [
            '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', 
            '#10b981', '#06b6d4', '#6366f1', '#ef4444',
            '#14b8a6', '#f97316'
        ];
        const index = code.charCodeAt(0) % colors.length;
        return colors[index];
    }

    getAvatarColorSecondary(code: string): string {
        const colors = [
            '#60a5fa', '#a78bfa', '#f472b6', '#fbbf24',
            '#34d399', '#22d3ee', '#818cf8', '#f87171',
            '#2dd4bf', '#fb923c'
        ];
        const index = code.charCodeAt(0) % colors.length;
        return colors[index];
    }

    onSearch(event: any) {
        this.searchValue.set(event.target.value);
    }

    // Show modal for creating new faculty
    show() {
        this.isEditMode.set(false);
        this.faculty = {
            name: '',
            code: '',
            institutionId: this.institutionId()
        };
        this.visible.set(true);
    }

    // Hide modal
    hide() {
        this.visible.set(false);
        this.selectedFaculty = null;
    }

    // Submit form
    onSubmit() {
        if (this.isEditMode()) {
            this.updateFaculty();
        } else {
            this.createFaculty();
        }
    }

    createFaculty() {
        const facultyName = this.faculty.name?.trim();
        const fullName = facultyName ? `Faculty of ${facultyName}` : '';
        
        const request: CreateFacultyRequest = {
            name: fullName,
            code: this.faculty.code!,
            institutionId: this.faculty.institutionId || this.institutionId()
        };

        this.facultyService.createFaculty(request).subscribe({
            next: (response) => {
                if (response.isSuccess && response.data) {
                    this.hide();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Faculty created successfully'
                    });
                    this.loadFaculties();
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: response.message || 'Failed to create faculty'
                    });
                }
            },
            error: (error: Error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Faculty Creation Failed',
                    detail: error.message || 'An error occurred'
                });
            }
        });
    }

    updateFaculty() {
        if (!this.selectedFaculty) return;

        const facultyName = this.faculty.name?.trim();
        const fullName = facultyName ? `Faculty of ${facultyName}` : '';

        const updateRequest: UpdateFacultyRequest = {
            id: this.selectedFaculty.id,
            name: fullName,
            code: this.faculty.code!
        };

        this.facultyService.updateFaculty(this.selectedFaculty.id, updateRequest).subscribe({
            next: (response) => {
                if (response.isSuccess) {
                    this.hide();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Faculty updated successfully'
                    });
                    this.loadFaculties();
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: response.message || 'Failed to update faculty'
                    });
                }
            },
            error: (error: Error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Update Failed',
                    detail: error.message || 'An error occurred'
                });
            }
        });
    }

    // Cancel and close
    onCancel() {
        this.hide();
    }

    viewDetails(faculty?: FacultyDto) {
        const facultyToView = faculty || this.selectedFaculty;
        if (facultyToView) {
            this.selectedFaculty = facultyToView;
            this.viewModalVisible.set(true);
        }
    }

    hideViewModal() {
        this.viewModalVisible.set(false);
        this.selectedFaculty = null;
    }

    editFaculty(faculty?: FacultyDto) {
        const facultyToEdit = faculty || this.selectedFaculty;
        if (facultyToEdit) {
            this.selectedFaculty = facultyToEdit;
            this.isEditMode.set(true);
            
            // Strip "Faculty of " prefix for editing
            const nameWithoutPrefix = facultyToEdit.name.replace(/^Faculty of /i, '').trim();
            
            this.faculty = {
                id: facultyToEdit.id,
                name: nameWithoutPrefix,
                code: facultyToEdit.code,
                institutionId: facultyToEdit.institutionId
            };
            this.visible.set(true);
        }
    }

    deleteFaculty(faculty?: FacultyDto) {
        const facultyToDelete = faculty || this.selectedFaculty;
        if (facultyToDelete && facultyToDelete.id) {
            if (confirm(`Are you sure you want to delete ${facultyToDelete.name}?`)) {
                this.facultyService.deleteFaculty(facultyToDelete.id).subscribe({
                    next: (response) => {
                        if (response.isSuccess) {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Success',
                                detail: 'Faculty deleted successfully'
                            });
                            this.loadFaculties();
                        } else {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: response.message || 'Failed to delete faculty'
                            });
                        }
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
