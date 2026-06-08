// src/app/features/certificates/ai-flags/ai-flags.component.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AiFraudService } from '@/core/services/ai-fraud.service';
import { AiFlagRecord } from '@/core/models/ai-fraud.model';

@Component({
    selector: 'app-ai-flags',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        ButtonModule,
        TagModule,
        DialogModule,
        TextareaModule,
        ToastModule,
        CardModule,
        FormsModule
    ],
    providers: [MessageService],
    templateUrl: './ai-flags.component.html'
})
export class AiFlagsComponent implements OnInit {
    private aiFraudService = inject(AiFraudService);
    private messageService = inject(MessageService);

    // Data
    flags = signal<AiFlagRecord[]>([]);
    loading = signal(true);
    totalRecords = signal(0);
    page = signal(1);
    pageSize = signal(10);

    // Review dialog
    showReviewDialog = false;
    selectedFlag = signal<AiFlagRecord | null>(null);
    reviewOutcome = signal<string>('');
    reviewNotes = '';
    isSubmitting = signal(false);

    // Stats
    totalPending = computed(() => this.totalRecords());
    highRiskCount = computed(() => this.flags().filter(f => f.fraudProbability >= 0.70).length);
    mediumRiskCount = computed(() => this.flags().filter(f => f.fraudProbability >= 0.30 && f.fraudProbability < 0.70).length);
    averageFraudScore = computed(() => {
        const items = this.flags();
        if (items.length === 0) return 0;
        return items.reduce((sum, f) => sum + f.fraudProbability, 0) / items.length;
    });

    ngOnInit() {
        this.loadFlags();
    }

    loadFlags() {
        this.loading.set(true);
        this.aiFraudService.getPendingFlags(this.page(), this.pageSize()).subscribe({
            next: (result) => {
                this.flags.set(result.items);
                this.totalRecords.set(result.totalCount);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Failed to load AI flags:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load AI review queue'
                });
                this.loading.set(false);
            }
        });
    }

    onPageChange(event: any) {
        this.page.set(Math.floor(event.first / event.rows) + 1);
        this.pageSize.set(event.rows);
        this.loadFlags();
    }

    openReviewDialog(flag: AiFlagRecord, outcome: string) {
        this.selectedFlag.set(flag);
        this.reviewOutcome.set(outcome);
        this.reviewNotes = '';
        this.showReviewDialog = true;
    }

    confirmReview() {
        const flag = this.selectedFlag();
        if (!flag) return;

        this.isSubmitting.set(true);
        this.aiFraudService.reviewFlag(flag.aiLogId, this.reviewOutcome(), this.reviewNotes).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Review Submitted',
                    detail: this.reviewOutcome() === 'CONFIRMED_FRAUD'
                        ? 'Certificate confirmed as fraudulent and permanently blocked.'
                        : 'Marked as false positive. Certificate can now be issued.'
                });
                this.showReviewDialog = false;
                this.isSubmitting.set(false);
                this.loadFlags();
            },
            error: (err) => {
                console.error('Review submission failed:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to submit review. Please try again.'
                });
                this.isSubmitting.set(false);
            }
        });
    }

    getRiskSeverity(probability: number): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        if (probability >= 0.70) return 'danger';
        if (probability >= 0.30) return 'warn';
        return 'success';
    }

    getRiskLabel(probability: number): string {
        if (probability >= 0.70) return 'HIGH';
        if (probability >= 0.30) return 'MEDIUM';
        return 'LOW';
    }
}
