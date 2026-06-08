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
import { ProgramDto } from '@/core/models/program.model';
import { ProgramService } from '@/core/services/program.service';
import { FacultyDto } from '@/core/models/faculty.model';
import { FacultyService } from '@/core/services/faculty.service';
import { AuthService } from '@/core/services/auth.service';
import { Permission } from '@/core/models/user.model';
import { QualificationType, AwardClass } from '@/core/models/api-response.model';

@Component({
    selector: 'app-programs',
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
        SelectModule
    ],
    templateUrl: './program.html',
    styleUrls: ['./program.scss']
})
export class ProgramComponent implements OnInit {
    programs = signal<ProgramDto[]>([]);
    faculties = signal<FacultyDto[]>([]);
    program: ProgramDto = {} as ProgramDto;
    selectedProgram: ProgramDto | null = null;
    searchValue = signal<string>('');
    programService = inject(ProgramService);
    facultyService = inject(FacultyService);
    messageService = inject(MessageService);
    private authService = inject(AuthService);
    canManage = this.authService.hasPermission(Permission.PROGRAM_MANAGE);
    visible = signal(false);
    viewModalVisible = signal(false);
    isEditMode = signal(false);

    qualificationTypes = [
        { label: 'Certificate', value: QualificationType.Certificate },
        { label: 'Diploma', value: QualificationType.Diploma },
        { label: 'Degree', value: QualificationType.Degree },
        { label: 'Masters Degree', value: QualificationType.MastersDegree },
        { label: 'Doctorate', value: QualificationType.Doctorate }
    ];

    awardClasses = [
        { label: 'Pass', value: AwardClass.Pass },
        { label: 'Lower Second', value: AwardClass.LowerSecond },
        { label: 'Upper Second', value: AwardClass.UpperSecond },
        { label: 'First Class', value: AwardClass.FirstClass },
        { label: 'Distinction', value: AwardClass.Distinction }
    ];

    // Check if the selected qualification type is a degree type (uses award class ratings)
    get isDegreeType(): boolean {
        return this.program.qualificationType === QualificationType.Degree ||
               this.program.qualificationType === QualificationType.MastersDegree ||
               this.program.qualificationType === QualificationType.Doctorate;
    }
    // Filtered programs based on search and status
    filteredPrograms = computed<ProgramDto[]>(() => {
        let filtered = this.programs();

        // Filter by search
        const search = this.searchValue().toLowerCase();
        if (search) {
            filtered = filtered.filter(c => 
                c.name.toLowerCase().includes(search) ||
                c.code.toLowerCase().includes(search)
            );
        }
        
        return filtered;
    });

    ngOnInit() {
        this.loadPrograms();
        this.loadFaculties();
    }

    loadPrograms() {
        this.programService.getAllPrograms().subscribe({
            next: (response) => {
                if (response.isSuccess) {
                    this.programs.set(response.data ?? []);
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load programs'
                    });
                }
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message || 'Failed to load programs'
                });
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

    getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'secondary' | 'info' | 'contrast' {
        switch (status) {
            case 'Active':
                return 'success';
            case 'Pending':
                return 'warn';
            case 'Revoked':
                return 'danger';
            case 'On Blockchain':
                return 'secondary';
            default:
                return 'info';
        }
    }

    formatDate(date: Date): string {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
        }).format(date);
    }

    onSearch(event: any) {
        this.searchValue.set(event.target.value);
    }

    getFacultyName(facultyId: number): string {
        const faculty = this.faculties().find(f => f.id === facultyId);
        return faculty ? faculty.name : 'N/A';
    }

    getQualificationTypeLabel(value: number): string {
        const type = this.qualificationTypes.find(t => t.value === value);
        return type ? type.label : 'N/A';
    }

    getAwardClassLabel(value: number | null | undefined): string {
        if (value == null) return 'N/A';
        const cls = this.awardClasses.find(c => c.value === value);
        return cls ? cls.label : 'N/A';
    }

    onQualificationTypeChange() {
        // Clear award class if not a degree type
        if (!this.isDegreeType) {
            this.program.awardClass = null;
        }
    }

    // Show modal for creating new program
    show() {
        this.isEditMode.set(false);
        this.program = {
            name: '',
            code: '',
            description: '',
            facultyId: this.faculties()[0]?.id || 0,
            qualificationType: QualificationType.Certificate,
            awardClass: null
        };
        this.visible.set(true);
    }

    // Hide modal
    hide() {
        this.visible.set(false);
        this.selectedProgram = null;
    }

    // Submit form
    onSubmit() {
        if (this.isEditMode()) {
            this.updateProgram();
        } else {
            this.createProgram();
        }
    }

    createProgram() {
        this.programService.createProgram(this.program).subscribe({
            next: (response) => {
                if (response.isSuccess && response.data) {
                    this.hide();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Program created successfully'
                    });
                    this.loadPrograms();
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: response.message || 'Failed to create program'
                    });
                }
            },
            error: (error: Error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Program Creation Failed',
                    detail: error.message || 'An error occurred'
                });
            }
        });
    }

    updateProgram() {
        if (!this.selectedProgram) return;

        const updateRequest = {
            ...this.program,
            id: this.selectedProgram.id
        };

        this.programService.updateProgram(updateRequest).subscribe({
            next: (response) => {
                if (response.isSuccess) {
                    this.hide();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Program updated successfully'
                    });
                    this.loadPrograms();
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: response.message || 'Failed to update program'
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

    viewDetails(program?: ProgramDto) {
        const programToView = program || this.selectedProgram;
        if (programToView) {
            this.selectedProgram = programToView;
            this.viewModalVisible.set(true);
        }
    }

    hideViewModal() {
        this.viewModalVisible.set(false);
        this.selectedProgram = null;
    }

    editProgram(program?: ProgramDto) {
        const programToEdit = program || this.selectedProgram;
        if (programToEdit) {
            this.selectedProgram = programToEdit;
            this.isEditMode.set(true);
            this.program = {
                id: programToEdit.id,
                name: programToEdit.name,
                code: programToEdit.code,
                description: programToEdit.description || '',
                facultyId: programToEdit.facultyId,
                qualificationType: programToEdit.qualificationType,
                awardClass: programToEdit.awardClass ?? null
            } as ProgramDto;
            this.visible.set(true);
        }
    }

    deleteProgram(program?: ProgramDto) {
        const programToDelete = program || this.selectedProgram;
        if (programToDelete && programToDelete.id) {
            if (confirm(`Are you sure you want to delete ${programToDelete.name}?`)) {
                this.programService.deleteProgram(programToDelete.id).subscribe({
                    next: (response) => {
                        if (response.isSuccess) {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Success',
                                detail: 'Program deleted successfully'
                            });
                            this.loadPrograms();
                        } else {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: response.message || 'Failed to delete program'
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