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

interface Certificate {
    id: string;
    studentName: string;
    studentId: string;
    certificateNumber: string;
    program: string;
    programDetail: string;
    award: string;
    status: 'Active' | 'Pending' | 'Revoked' | 'On Blockchain';
    issued: Date;
}

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
    templateUrl: './certificate-list.html',
    styleUrls: ['./certificate-list.scss']
})
export class CertificateListComponent implements OnInit {
    certificates = signal<Certificate[]>([]);
    searchValue = signal<string>('');
    selectedStatus = signal<string>('All Status');
    //router = inject(Router);
    statusOptions = [
        { label: 'All Status', value: 'All Status' },
        { label: 'Active', value: 'Active' },
        { label: 'Pending', value: 'Pending' },
        { label: 'Revoked', value: 'Revoked' },
        { label: 'On Blockchain', value: 'On Blockchain' }
    ];

    // Computed statistics
    statusCounts = computed<StatusCount[]>(() => {
        const certs = this.certificates();
        return [
            {
                status: 'Active',
                count: certs.filter(c => c.status === 'Active').length,
                icon: 'pi pi-check-circle',
                iconColor: 'text-blue-500',
                bgColor: 'bg-blue-50 dark:bg-blue-500/10'
            },
            {
                status: 'Pending',
                count: certs.filter(c => c.status === 'Pending').length,
                icon: 'pi pi-clock',
                iconColor: 'text-orange-500',
                bgColor: 'bg-orange-50 dark:bg-orange-500/10'
            },
            {
                status: 'Revoked',
                count: certs.filter(c => c.status === 'Revoked').length,
                icon: 'pi pi-times-circle',
                iconColor: 'text-red-500',
                bgColor: 'bg-red-50 dark:bg-red-500/10'
            },
            {
                status: 'On Blockchain',
                count: certs.filter(c => c.status === 'On Blockchain').length,
                icon: 'pi pi-th-large',
                iconColor: 'text-gray-500',
                bgColor: 'bg-gray-50 dark:bg-gray-500/10'
            }
        ];
    });

    // Filtered certificates based on search and status
    filteredCertificates = computed<Certificate[]>(() => {
        let filtered = this.certificates();
        
        // Filter by status
        if (this.selectedStatus() !== 'All Status') {
            filtered = filtered.filter(c => c.status === this.selectedStatus());
        }
        
        // Filter by search
        const search = this.searchValue().toLowerCase();
        if (search) {
            filtered = filtered.filter(c => 
                c.studentName.toLowerCase().includes(search) ||
                c.studentId.toLowerCase().includes(search) ||
                c.certificateNumber.toLowerCase().includes(search) ||
                c.program.toLowerCase().includes(search)
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
        // Sample data matching the screenshot
        const mockData: Certificate[] = [
            {
                id: '1',
                studentName: 'Munashe Keith Gandari',
                studentId: 'N0222042W',
                certificateNumber: 'NUST/BSC/CS/2025/0001',
                program: 'Bachelor of Science Honours...',
                programDetail: 'Artificial Intelligence',
                award: 'Upper Second',
                status: 'Active',
                issued: new Date('2025-09-25')
            },
            {
                id: '2',
                studentName: 'Tatenda Chikwanha',
                studentId: 'N0220156M',
                certificateNumber: 'NUST/BSC/EE/2025/0042',
                program: 'Bachelor of Science Honours...',
                programDetail: 'Electrical Engineering',
                award: 'First Class',
                status: 'Active',
                issued: new Date('2025-09-25')
            },
            {
                id: '3',
                studentName: 'Rumbidzai Nyathi',
                studentId: 'N0211803K',
                certificateNumber: 'NUST/MBA/2025/0015',
                program: 'Master of Business Administ...',
                programDetail: 'Finance',
                award: 'Distinction',
                status: 'Active',
                issued: new Date('2025-09-26')
            },
            {
                id: '4',
                studentName: 'Blessing Moyo',
                studentId: 'N0201987P',
                certificateNumber: 'NUST/DIP/IT/2024/0089',
                program: 'Diploma in Information Techn...',
                programDetail: 'Information Technology',
                award: 'Merit',
                status: 'Revoked',
                issued: new Date('2024-12-18')
            },
            {
                id: '5',
                studentName: 'Tanaka Mutasa',
                studentId: 'N0220198L',
                certificateNumber: 'NUST/BSC/CS/2025/0023',
                program: 'Bachelor of Science Honours...',
                programDetail: 'Cybersecurity',
                award: 'Upper Second',
                status: 'Pending',
                issued: new Date('2025-09-28')
            },
            {
                id: '6',
                studentName: 'Farai Ncube',
                studentId: 'N0221045T',
                certificateNumber: 'NUST/BSC/CS/2025/0067',
                program: 'Bachelor of Science Honours...',
                programDetail: 'Computer Science',
                award: 'Upper Second',
                status: 'On Blockchain',
                issued: new Date('2025-09-27')
            },
            {
                id: '7',
                studentName: 'Chipo Mlambo',
                studentId: 'N0219876K',
                certificateNumber: 'NUST/BSC/CS/2025/0089',
                program: 'Bachelor of Science Honours...',
                programDetail: 'Data Science',
                award: 'First Class',
                status: 'On Blockchain',
                issued: new Date('2025-09-26')
            }
        ];

        this.certificates.set(mockData);
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

    onStatusChange(event: any) {
        this.selectedStatus.set(event.value);
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