// src/app/features/certificates/ai-logs/ai-logs.component.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageService } from 'primeng/api';
import { AiFraudService } from '@/core/services/ai-fraud.service';
import { AiLogRecord, AiDashboardStats } from '@/core/models/ai-fraud.model';

@Component({
    selector: 'app-ai-logs',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        TagModule,
        ToastModule,
        CardModule,
        ProgressBarModule
    ],
    providers: [MessageService],
    templateUrl: './ai-logs.component.html'
})
export class AiLogsComponent implements OnInit {
    private aiFraudService = inject(AiFraudService);
    private messageService = inject(MessageService);

    // Data
    logs = signal<AiLogRecord[]>([]);
    loading = signal(true);
    totalRecords = signal(0);
    page = signal(1);
    pageSize = signal(20);
    stats = signal<AiDashboardStats | null>(null);

    // Computed stats
    statsLoading = signal(true);

    ngOnInit() {
        this.loadLogs();
        this.loadStats();
    }

    loadLogs() {
        this.loading.set(true);
        this.aiFraudService.getAiLogs(this.page(), this.pageSize()).subscribe({
            next: (result) => {
                this.logs.set(result.data);
                this.totalRecords.set(result.totalCount);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Failed to load AI logs:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load AI detection logs'
                });
                this.loading.set(false);
            }
        });
    }

    loadStats() {
        this.statsLoading.set(true);
        this.aiFraudService.getAiStats().subscribe({
            next: (stats) => {
                this.stats.set(stats);
                this.statsLoading.set(false);
            },
            error: () => {
                this.statsLoading.set(false);
            }
        });
    }

    onPageChange(event: any) {
        this.page.set(Math.floor(event.first / event.rows) + 1);
        this.pageSize.set(event.rows);
        this.loadLogs();
    }

    getRiskSeverity(probability: number): "danger" | "warn" | "success" | "info" {
        if (probability >= 0.70) return 'danger';
        if (probability >= 0.30) return 'warn';
        return 'success';
    }

    getVerdictSeverity(verdict: string): "danger" | "warn" | "success" | "info" | "secondary" {
        if (verdict.includes('FRAUD') || verdict.includes('BLOCKED')) return 'danger';
        if (verdict.includes('REVIEW') || verdict.includes('FLAG')) return 'warn';
        if (verdict.includes('CLEAR') || verdict.includes('PASS')) return 'success';
        if (verdict.includes('UNAVAILABLE')) return 'secondary';
        return 'info';
    }

    getReviewSeverity(outcome: string | null): "danger" | "success" | "warn" | "info" {
        if (outcome === 'CONFIRMED_FRAUD') return 'danger';
        if (outcome === 'FALSE_POSITIVE') return 'success';
        return 'warn';
    }

    getReviewLabel(outcome: string | null): string {
        if (outcome === 'CONFIRMED_FRAUD') return 'Confirmed Fraud';
        if (outcome === 'FALSE_POSITIVE') return 'False Positive';
        return 'Pending Review';
    }
}
