import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Router } from 'express';
import { RouterLink } from "@angular/router";
import { ProgramDto } from '@/core/models/program.model';
import { ProgramService } from '@/core/services/program.service';



interface StatusCount {
    status: string;
    count: number;
    icon: string;
    iconColor: string;
    bgColor: string;
}

@Component({
    selector: 'app-certificates',
    standalone: true,
    imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    TableModule,
    InputTextModule,
    SelectModule,
    TagModule,
    MenuModule,
    RouterLink,
    IconFieldModule,
    InputIconModule
],
    templateUrl: './program.html',
    styleUrls: ['./program.scss']
})
export class ProgramComponent implements OnInit {
    programs = signal<ProgramDto[]>([]);
    searchValue = signal<string>('');
    programService = inject(ProgramService);

    // Computed statistics
    

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

    actionMenuItems: MenuItem[] = [
        {
            label: 'View Details',
            icon: 'pi pi-eye',
            command: () => this.viewDetails()
        },
        {
            label: 'Download',
            icon: 'pi pi-download',
            command: () => this.download()
        },
        {
            label: 'Verify',
            icon: 'pi pi-verified',
            command: () => this.verify()
        },
        {
            separator: true
        },
        {
            label: 'Revoke',
            icon: 'pi pi-ban',
            command: () => this.revoke()
        }
    ];

    ngOnInit() {
        this.loadCertificates();
    }

    

    loadCertificates() {
        this.programService.getAllPrograms().subscribe((response) => {
            if (response.isSuccess) {
                this.programs.set(response.data ?? []);
            } else {
                console.error('Failed to load programs');
            }
        });
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

    

    batchUpload() {
        console.log('Batch upload clicked');
        // Implement batch upload logic
    }

    issueCertificate() {
        //this.router.navigate(['/certificates/create']);
    }

    viewDetails() {
        console.log('View details');
    }

    download() {
        console.log('Download certificate');
    }

    verify() {
        console.log('Verify certificate');
    }

    revoke() {
        console.log('Revoke certificate');
    }
}