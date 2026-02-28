import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { MenuModule } from 'primeng/menu';
import { MenuItem, MessageService } from 'primeng/api';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { StudentService } from '@/core/services/student.service';
import { Student } from '@/core/models/api-response.model';
import { CreateStudentRequest } from '@/core/models/student.model';
import { AuthService } from '@/core/services/auth.service';
import { Permission } from '@/core/models/user.model';

@Component({
    selector: 'app-students',
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
        MenuModule,
        IconFieldModule,
        InputIconModule,
        DialogModule,
        ToastModule,
        TooltipModule
    ],
    templateUrl: './student.html',
    styleUrls: ['./student.scss']
})
export class StudentComponent implements OnInit {
    students = signal<Student[]>([]);
    student: CreateStudentRequest = {} as CreateStudentRequest;
    selectedStudent: Student | null = null;
    searchValue = signal<string>('');
    studentService = inject(StudentService);
    messageService = inject(MessageService);
    private authService = inject(AuthService);
    canManage = this.authService.hasPermission(Permission.STUDENT_MANAGE);
    canBulkUpload = this.authService.hasPermission(Permission.STUDENT_BULK_UPLOAD);
    visible = signal(false);
    viewModalVisible = signal(false);
    isEditMode = signal(false);

    // Filtered students based on search
    filteredStudents = computed<Student[]>(() => {
        let filtered = this.students();

        // Filter by search
        const search = this.searchValue().toLowerCase();
        if (search) {
            filtered = filtered.filter(s => 
                s.firstName.toLowerCase().includes(search) ||
                s.lastName.toLowerCase().includes(search) ||
                s.studentNumber.toLowerCase().includes(search) ||
                s.email.toLowerCase().includes(search)
            );
        }
        
        return filtered;
    });

    actionMenuItems: MenuItem[] = [
        {
            label: 'View Details',
            icon: 'pi pi-eye',
            command: () => this.viewDetails()
        },
        {
            label: 'Edit',
            icon: 'pi pi-pencil',
            command: () => this.editStudent(),
            visible: this.canManage
        },
        {
            separator: true
        },
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            command: () => this.deleteStudent(),
            visible: this.canManage
        }
    ];

    ngOnInit() {
        this.loadStudents();
    }

    loadStudents() {
        this.studentService.getAllStudents().subscribe({
            next: (response) => {
                if (response.isSuccess) {
                    this.students.set(response.data ?? []);
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load students'
                    });
                }
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message || 'Failed to load students'
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

    getFullName(student: Student): string {
        return `${student.firstName} ${student.lastName}`;
    }

    getInitials(student: Student): string {
        return `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase();
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

    calculateAge(dateOfBirth: Date | string): number {
        const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        return age;
    }

    onSearch(event: any) {
        this.searchValue.set(event.target.value);
    }

    // Show modal for creating new student
    show() {
        this.isEditMode.set(false);
        this.student = {
            studentNumber: '',
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            email: '',
            phoneNumber: ''
        };
        this.visible.set(true);
    }

    // Hide modal
    hide() {
        this.visible.set(false);
        this.selectedStudent = null;
    }

    // Submit form
    onSubmit() {
        if (this.isEditMode()) {
            this.updateStudent();
        } else {
            this.createStudent();
        }
    }

    createStudent() {
        this.studentService.createStudent(this.student).subscribe({
            next: (response) => {
                if (response.isSuccess && response.data) {
                    this.hide();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Student created successfully'
                    });
                    this.loadStudents();
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: response.message || 'Failed to create student'
                    });
                }
            },
            error: (error: Error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Student Creation Failed',
                    detail: error.message || 'An error occurred'
                });
            }
        });
    }

    updateStudent() {
        if (!this.selectedStudent) return;

        const updateRequest = {
            id: this.selectedStudent.id,
            ...this.student
        };

        this.studentService.updateStudent(updateRequest).subscribe({
            next: (response) => {
                if (response.isSuccess) {
                    this.hide();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Student updated successfully'
                    });
                    this.loadStudents();
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: response.message || 'Failed to update student'
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

    viewDetails(student?: Student) {
        const studentToView = student || this.selectedStudent;
        if (studentToView) {
            this.selectedStudent = studentToView;
            this.viewModalVisible.set(true);
        }
    }

    hideViewModal() {
        this.viewModalVisible.set(false);
        this.selectedStudent = null;
    }

    editStudent(student?: Student) {
        const studentToEdit = student || this.selectedStudent;
        if (studentToEdit) {
            this.selectedStudent = studentToEdit;
            this.isEditMode.set(true);
            this.student = {
                studentNumber: studentToEdit.studentNumber,
                firstName: studentToEdit.firstName,
                lastName: studentToEdit.lastName,
                dateOfBirth: studentToEdit.dateOfBirth.toString().split('T')[0],
                email: studentToEdit.email,
                phoneNumber: studentToEdit.phoneNumber || ''
            };
            this.visible.set(true);
        }
    }

    deleteStudent(student?: Student) {
        const studentToDelete = student || this.selectedStudent;
        if (studentToDelete) {
            if (confirm(`Are you sure you want to delete ${this.getFullName(studentToDelete)}?`)) {
                this.studentService.deleteStudent(studentToDelete.id).subscribe({
                    next: (response) => {
                        if (response.isSuccess) {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Success',
                                detail: 'Student deleted successfully'
                            });
                            this.loadStudents();
                        } else {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: response.message || 'Failed to delete student'
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

    setSelectedStudent(student: Student) {
        this.selectedStudent = student;
    }

    bulkUpload() {
        // Create file input element
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = (e: any) => {
            const file = e.target.files[0];
            if (file) {
                this.studentService.bulkUpload(file).subscribe({
                    next: (response) => {
                        if (response.isSuccess) {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Success',
                                detail: 'Students imported successfully'
                            });
                            this.loadStudents();
                        } else {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: response.message || 'Import failed'
                            });
                        }
                    },
                    error: (error: Error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Import Failed',
                            detail: error.message || 'An error occurred'
                        });
                    }
                });
            }
        };
        input.click();
    }
}
